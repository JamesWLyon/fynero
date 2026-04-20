"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_RULES } from "@/lib/finance/categories";
import { categorizeTransaction } from "@/lib/finance/categorize";
import {
    buildMergedCategoryTree,
    getNodeByPath,
    mapPathToLegacyFields,
    normalizeCategoryLabel,
    type CategoryTreeNode,
    type UserCategoryRow,
} from "@/lib/finance/categoryTree";

type AddCategoryResult = {
    error: string | null;
};

type SaveCategoryResult = {
    error: string | null;
};

type DeleteCategoryResult = {
    error: string | null;
    reassignedCount?: number;
};

type TransactionRow = {
    id: string;
    amount?: number | string | null;
    description?: string | null;
    name?: string | null;
    category?: string | null;
    sub_category?: string | null;
    category_path?: string | null;
    type?: string | null;
};

export function useCategoryEditor() {
    const supabase = createClient();

    const [userCategories, setUserCategories] = useState<UserCategoryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadUserCategories() {
            setInitialLoading(true);

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                if (!cancelled) {
                    setUserCategories([]);
                    setInitialLoading(false);
                }
                return;
            }

            const { data, error } = await supabase
                .from("user_categories")
                .select("id, label, parent_path, full_path")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (!cancelled) {
                if (error) {
                    console.error(error);
                    setUserCategories([]);
                } else {
                    setUserCategories((data as UserCategoryRow[]) || []);
                }

                setInitialLoading(false);
            }
        }

        loadUserCategories();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    const tree = useMemo(() => {
        return buildMergedCategoryTree(CATEGORY_RULES, userCategories);
    }, [userCategories]);

    const getChildren = useCallback(
        (path: string | null) => {
            if (!path) return tree;
            const node = getNodeByPath(tree, path);
            return node?.children ?? [];
        },
        [tree]
    );

    const addCustomCategory = useCallback(
        async (parentPath: string, label: string): Promise<AddCategoryResult> => {
            const trimmed = label.trim();
            if (!trimmed) {
                return { error: "Category name cannot be empty." };
            }

            const parentNode = getNodeByPath(tree, parentPath);
            if (!parentNode && parentPath !== "income" && parentPath !== "spent") {
                return { error: "Parent category was not found." };
            }

            const normalizedKey = normalizeCategoryLabel(trimmed);
            const fullPath = `${parentPath}.${normalizedKey}`;

            const duplicate = userCategories.find(
                (cat) => cat.full_path.toLowerCase() === fullPath.toLowerCase()
            );

            if (duplicate) {
                return { error: "That category already exists." };
            }

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                return { error: "Not signed in." };
            }

            const { data, error } = await supabase
                .from("user_categories")
                .insert({
                    user_id: user.id,
                    label: trimmed,
                    parent_path: parentPath,
                    full_path: fullPath,
                })
                .select("id, label, parent_path, full_path")
                .single();

            if (error) {
                return { error: error.message };
            }

            setUserCategories((prev) => [...prev, data as UserCategoryRow]);
            return { error: null };
        },
        [supabase, tree, userCategories]
    );

    const saveTransactionCategory = useCallback(
        async (transactionId: string, selectedPath: string): Promise<SaveCategoryResult> => {
            if (!transactionId) {
                return { error: "Transaction id is missing." };
            }

            if (!selectedPath) {
                return { error: "No category path selected." };
            }

            setLoading(true);

            const mapped = mapPathToLegacyFields(selectedPath);

            const { error } = await supabase
                .from("transactions")
                .update({
                    category_path: selectedPath,
                    category: mapped.category,
                    sub_category: mapped.sub_category,
                    type: mapped.type,
                })
                .eq("id", transactionId);

            setLoading(false);

            if (error) {
                return { error: error.message };
            }

            return { error: null };
        },
        [supabase]
    );

    const deleteCustomCategory = useCallback(
        async (category: UserCategoryRow): Promise<DeleteCategoryResult> => {
            setLoading(true);

            const { data: affectedRows, error: affectedError } = await supabase
                .from("transactions")
                .select("id, amount, description, category, sub_category, category_path, type")
                .eq("category_path", category.full_path);

            if (affectedError) {
                setLoading(false);
                return { error: affectedError.message };
            }

            const affected = (affectedRows as TransactionRow[]) || [];

            for (const tx of affected) {
                const recategorized = categorizeTransaction({
                    ...tx,
                    name: tx.description ?? tx.name ?? "",
                });

                const fallbackPath = recategorized.path.join(".");
                const mapped = mapPathToLegacyFields(fallbackPath);

                const { error: updateError } = await supabase
                    .from("transactions")
                    .update({
                        category_path: fallbackPath,
                        category: mapped.category,
                        sub_category: mapped.sub_category,
                        type: mapped.type,
                    })
                    .eq("id", tx.id);

                if (updateError) {
                    setLoading(false);
                    return { error: updateError.message };
                }
            }

            const { error: deleteError } = await supabase
                .from("user_categories")
                .delete()
                .eq("id", category.id);

            if (deleteError) {
                setLoading(false);
                return { error: deleteError.message };
            }

            setUserCategories((prev) => prev.filter((item) => item.id !== category.id));
            setLoading(false);

            return {
                error: null,
                reassignedCount: affected.length,
            };
        },
        [supabase]
    );

    return {
        tree,
        userCategories,
        loading,
        initialLoading,
        getChildren,
        addCustomCategory,
        deleteCustomCategory,
        saveTransactionCategory,
    };
}