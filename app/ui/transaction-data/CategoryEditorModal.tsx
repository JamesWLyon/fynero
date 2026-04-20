"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus, Check, Loader2, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import {
    useCategoryEditor,
} from "./useCategoryEditor";
import {
    getDisplayLabelFromPath,
    type CategoryTreeNode,
    type UserCategoryRow,
} from "@/lib/finance/categoryTree";

type Props = {
    transactionId: string;
    currentCategory: string;
    onSave: (newCategoryPath: string) => void;
    onClose: () => void;
};

export default function CategoryEditorModal({
    transactionId,
    currentCategory,
    onSave,
    onClose,
}: Props) {
    const {
        tree,
        userCategories,
        loading,
        initialLoading,
        getChildren,
        addCustomCategory,
        deleteCustomCategory,
        saveTransactionCategory,
    } = useCategoryEditor();

    const overlayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [currentPath, setCurrentPath] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState(currentCategory || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        if (currentCategory) {
            const parts = currentCategory.split(".").filter(Boolean);

            if (parts.length > 1) {
                setCurrentPath(parts.slice(0, -1).join("."));
            } else {
                setCurrentPath(null);
            }

            setSelectedPath(currentCategory);
        }
    }, [currentCategory]);

    useEffect(() => {
        if (showAddForm) {
            inputRef.current?.focus();
        }
    }, [showAddForm]);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) {
            onClose();
        }
    }

    const breadcrumbs = useMemo(() => {
        if (!currentPath) return [];

        const parts = currentPath.split(".").filter(Boolean);
        return parts.map((_, index) => {
            const path = parts.slice(0, index + 1).join(".");
            return {
                path,
                label: getDisplayLabelFromPath(path),
            };
        });
    }, [currentPath]);

    const visibleNodes = useMemo<CategoryTreeNode[]>(() => {
        return currentPath ? getChildren(currentPath) : tree;
    }, [currentPath, getChildren, tree]);

    const currentCustomChildren = useMemo(() => {
        const parentPath = currentPath ?? "";
        return userCategories.filter((cat) => cat.parent_path === parentPath);
    }, [userCategories, currentPath]);

    const canGoBack = currentPath !== null;

    function goBack() {
        if (!currentPath) return;

        const parts = currentPath.split(".").filter(Boolean);
        if (parts.length <= 1) {
            setCurrentPath(null);
            return;
        }

        setCurrentPath(parts.slice(0, -1).join("."));
    }

    async function handleSave() {
        if (!selectedPath) {
            setError("Please select a category.");
            return;
        }

        if (selectedPath === currentCategory) {
            onClose();
            return;
        }

        setSaving(true);
        setError(null);

        const { error: saveError } = await saveTransactionCategory(transactionId, selectedPath);

        setSaving(false);

        if (saveError) {
            setError(saveError);
            return;
        }

        onSave(selectedPath);
        onClose();
    }

    async function handleAddCategory() {
        if (!currentPath) {
            setAddError("Open the parent category where you want to add this.");
            return;
        }

        if (!newLabel.trim()) {
            setAddError("Please enter a category name.");
            return;
        }

        setAddLoading(true);
        setAddError(null);

        const { error: createError } = await addCustomCategory(currentPath, newLabel);

        setAddLoading(false);

        if (createError) {
            setAddError(createError);
            return;
        }

        setNewLabel("");
        setShowAddForm(false);
    }

    async function handleDeleteCategory(category: UserCategoryRow) {
        setAddError(null);
        setError(null);

        const result = await deleteCustomCategory(category);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (selectedPath === category.full_path) {
            setSelectedPath(currentPath ?? "");
        }
    }

    function renderNode(node: CategoryTreeNode) {
        const isSelected = selectedPath === node.path;
        const hasChildren = node.children.length > 0;

        const customCategory = node.isCustom
            ? userCategories.find((cat) => cat.full_path === node.path)
            : null;

        return (
            <div
                key={node.path}
                className={`
                    group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5
                    transition-all duration-150
                    ${isSelected
                        ? "border-white/30 bg-white/[0.12] text-white"
                        : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.07] hover:border-white/20 hover:text-white"
                    }
                `}
            >
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPath(node.path);
                        setError(null);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                    {isSelected && <Check size={14} className="shrink-0" />}
                    <span className="truncate">{node.label}</span>
                    {node.isCustom && (
                        <span className="rounded border border-white/15 px-1 py-0.5 text-[10px] leading-none text-white/40">
                            custom
                        </span>
                    )}
                </button>

                <div className="flex shrink-0 items-center gap-1">
                    {node.isCustom && customCategory && (
                        <button
                            type="button"
                            onClick={() => handleDeleteCategory(customCategory)}
                            className="text-white/30 transition-colors hover:text-red-400"
                            aria-label={`Delete ${node.label}`}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}

                    {hasChildren && (
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentPath(node.path);
                                setError(null);
                            }}
                            className="text-white/40 transition-colors hover:text-white"
                            aria-label={`Open ${node.label}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white">Edit Category</h2>
                        <p className="mt-1 truncate text-sm text-white/45">
                            Select any parent or leaf category, or add a custom child category.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="border-b border-white/10 px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPath(null)}
                            className={`rounded-md px-2 py-1 text-sm transition-colors ${
                                currentPath === null
                                    ? "bg-white/[0.10] text-white"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Root
                        </button>

                        {breadcrumbs.map((crumb) => (
                            <button
                                key={crumb.path}
                                type="button"
                                onClick={() => setCurrentPath(crumb.path)}
                                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                                    currentPath === crumb.path
                                        ? "bg-white/[0.10] text-white"
                                        : "text-white/50 hover:text-white"
                                }`}
                            >
                                {crumb.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-white/55">
                            Viewing:{" "}
                            <span className="text-white">
                                {currentPath ? getDisplayLabelFromPath(currentPath) : "Root"}
                            </span>
                        </div>

                        {canGoBack && (
                            <button
                                type="button"
                                onClick={goBack}
                                className="inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
                            >
                                <ChevronLeft size={15} />
                                Back
                            </button>
                        )}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {initialLoading ? (
                        <div className="flex items-center justify-center py-12 text-white/50">
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Loading categories...
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {visibleNodes.map(renderNode)}

                            {visibleNodes.length === 0 && (
                                <div className="py-8 text-center text-sm text-white/40">
                                    No categories here yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showAddForm && (
                    <div className="border-t border-white/10 px-5 py-4">
                        <p className="mb-3 text-sm font-medium text-white/65">
                            Add a custom category under{" "}
                            <span className="text-white">
                                {currentPath ? getDisplayLabelFromPath(currentPath) : "Root"}
                            </span>
                        </p>

                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newLabel}
                                onChange={(e) => {
                                    setNewLabel(e.target.value);
                                    setAddError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddCategory();
                                    }
                                }}
                                placeholder="Category name..."
                                className="
                                    flex-1 rounded-lg border border-white/15 bg-white/[0.05]
                                    px-3 py-2 text-sm text-white placeholder-white/30
                                    outline-none transition-all
                                    focus:border-white/30 focus:bg-white/[0.08]
                                "
                            />

                            <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={addLoading}
                                className="
                                    inline-flex items-center gap-2 rounded-lg border border-white/15
                                    bg-white/[0.10] px-4 py-2 text-sm font-medium text-white
                                    transition-all hover:bg-white/[0.15] disabled:opacity-50
                                "
                            >
                                {addLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Check size={14} />
                                )}
                                Save
                            </button>
                        </div>

                        {addError && (
                            <p className="mt-2 text-xs text-red-400">{addError}</p>
                        )}

                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewLabel("");
                                    setAddError(null);
                                }}
                                className="text-sm text-white/50 transition-colors hover:text-white"
                            >
                                Cancel adding category
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="border-t border-white/10 px-5 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                    {!showAddForm ? (
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(true);
                                setAddError(null);
                            }}
                            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                        >
                            <Plus size={15} />
                            Add category
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-lg border border-white/10 bg-white/[0.03]
                                px-4 py-2 text-sm text-white/60 transition-all
                                hover:bg-white/[0.07] hover:text-white
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="
                                inline-flex items-center gap-2 rounded-lg
                                bg-white px-4 py-2 text-sm font-medium text-black
                                transition-all hover:bg-white/90 disabled:opacity-50
                            "
                        >
                            {saving || loading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Check size={14} />
                            )}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}