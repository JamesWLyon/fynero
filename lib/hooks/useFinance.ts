"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { aggregateTransactions } from "@/lib/finance/aggregate";
import { filterByTime } from "@/lib/finance/filterTime";
import { getValue } from "@/lib/finance/getValue";
import { TimeFilter } from "@/lib/finance/TimeFilter";
import { CATEGORY_RULES } from "@/lib/finance/categories";
import {
    buildMergedCategoryTree,
    getChildrenOfPath,
    getDisplayLabelFromPath,
    type UserCategoryRow,
} from "@/lib/finance/categoryTree";

type ChildChartEntry = {
    label: string;
    value: number;
    colorKey?: string;
    path: string;
};

export function useFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userCategories, setUserCategories] = useState<UserCategoryRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            const [transactionsResult, authResult] = await Promise.all([
                supabase.from("transactions").select("*"),
                supabase.auth.getUser(),
            ]);

            if (transactionsResult.error) {
                console.error(transactionsResult.error);
                setLoading(false);
                return;
            }

            setTransactions(transactionsResult.data || []);

            const user = authResult.data.user;

            if (user) {
                const { data: userCategoryData, error: userCategoryError } = await supabase
                    .from("user_categories")
                    .select("id, label, parent_path, full_path")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true });

                if (userCategoryError) {
                    console.error(userCategoryError);
                } else {
                    setUserCategories((userCategoryData as UserCategoryRow[]) || []);
                }
            }

            setLoading(false);
        }

        load();
    }, []);

    const aggregatedAll = useMemo(() => {
        return aggregateTransactions(transactions);
    }, [transactions]);

    const tree = useMemo(() => {
        return buildMergedCategoryTree(CATEGORY_RULES, userCategories);
    }, [userCategories]);

    const get = useCallback((path: string, time?: TimeFilter) => {
        if (!time || time === "all") {
            return getValue(aggregatedAll, path);
        }

        const filtered = filterByTime(transactions, time);
        const aggregated = aggregateTransactions(filtered);

        return getValue(aggregated, path);
    }, [transactions, aggregatedAll]);

    const getChildNodes = useCallback((parentPath: string) => {
        return getChildrenOfPath(tree, parentPath);
    }, [tree]);

    const getChildPaths = useCallback((parentPath: string) => {
        return getChildrenOfPath(tree, parentPath).map((node) => node.path);
    }, [tree]);

    const getChildChartData = useCallback((
        parentPath: string,
        time?: TimeFilter
    ): ChildChartEntry[] => {
        const children = getChildrenOfPath(tree, parentPath);

        return children.map((node) => ({
            label: node.label,
            value: get(node.path, time),
            colorKey: node.path.split(".").pop()?.toLowerCase(),
            path: node.path,
        }));
    }, [tree, get]);

    const getExpandedChildChartData = useCallback((
        parentPath: string,
        time?: TimeFilter
    ): ChildChartEntry[] => {
        const directChildren = getChildrenOfPath(tree, parentPath);

        const expandedNodes = directChildren.flatMap((node) => {
            if (node.children.length > 0) {
                return node.children;
            }

            return [node];
        });

        return expandedNodes
        .map((node) => ({
            label: node.label,
            value: get(node.path, time),
            colorKey: node.path.split(".").pop()?.toLowerCase(),
            path: node.path,
        }))
        .filter((item) => item.value > 0);
    }, [tree, get]);

    const getNodeChartData = useCallback((
        paths: string[],
        time?: TimeFilter
    ): ChildChartEntry[] => {
        return paths.map((path) => ({
            label: getDisplayLabelFromPath(path),
            value: get(path, time),
            colorKey: path.split(".").pop()?.toLowerCase(),
            path,
        }));
    }, [get]);

    return {
        transactions,
        userCategories,
        loading,
        aggregatedAll,
        tree,
        get,
        getChildNodes,
        getChildPaths,
        getChildChartData,
        getExpandedChildChartData,
        getNodeChartData,
    };
}