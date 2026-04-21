"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { resolveColor } from "@/app/config/chartColors";
import Icon from "../Icon";
import CategoryEditorModal from "./CategoryEditorModal";
import { getDisplayLabelFromPath } from "@/lib/finance/categoryTree";

type Transaction = {
    id?: string;
    plaid_transaction_id?: string;
    date?: string;
    created_at?: string;
    name?: string;
    description?: string;
    category?: string | null;
    sub_category?: string | null;
    category_path?: string | null;
    type?: string | null;
    amount?: number | string | null;
    account?: string | null;
    account_name?: string | null;
    account_display_name?: string | null;
    account_mask?: string | null;
};

type ShowTransactionsProps = {
    transactions: Transaction[];
    className?: string;
    limit?: number;
    newestFirst?: boolean;
    showDate?: boolean;
    showCategory?: boolean;
    showAccount?: boolean;
    showAmount?: boolean;
    showIcon?: boolean;
    pages?: boolean;
    editCategory?: boolean;
    showIncome?: boolean;
};

function normalizeText(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s&+-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function formatDate(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function getDisplayName(tx: Transaction) {
    return tx.description || tx.name || "Unknown transaction";
}

function getTransactionPath(tx: Transaction) {
    if (tx.category_path && tx.category_path.trim()) {
        return tx.category_path;
    }

    if (tx.category === "income" || (tx.type || "").toLowerCase() === "income") {
        return tx.sub_category ? `income.${tx.sub_category}` : "income";
    }

    if (tx.category === "debt") {
        return tx.sub_category ? `spent.debt.${tx.sub_category}` : "spent.debt";
    }

    if (tx.category === "savings") {
        return tx.sub_category ? `spent.savings.${tx.sub_category}` : "spent.savings";
    }

    if (tx.category) {
        return tx.sub_category
            ? `spent.expenses.${tx.category}.${tx.sub_category}`
            : `spent.expenses.${tx.category}`;
    }

    return "spent.expenses.other";
}

function getDisplayAccount(tx: Transaction) {
    if (tx.account_display_name) return tx.account_display_name;
    if (tx.account_name) return tx.account_name;
    if (tx.account) return tx.account;
    if (tx.account_mask) return `•••• ${tx.account_mask}`;
    return "Unknown";
}

function getRawAmount(tx: Transaction) {
    return Number(tx.amount || 0);
}

function isIncome(tx: Transaction) {
    return (tx.type || "").toLowerCase() === "income" || tx.category === "income";
}

function isRefundLike(tx: Transaction) {
    const rawAmount = getRawAmount(tx);
    const name = normalizeText(getDisplayName(tx));

    if (rawAmount < 0) return true;

    return [
        "refund",
        "returned",
        "return",
        "reversal",
        "reversed",
        "merchant credit",
        "statement credit",
    ].some((term) => name.includes(term));
}

function hexToRgba(hex: string, alpha: number) {
    const clean = hex.replace("#", "");

    if (clean.length !== 6) {
        return `rgba(148, 163, 184, ${alpha})`;
    }

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getMerchantIcon(name: string) {
    const normalized = normalizeText(name);

    const iconMap: Array<{ match: string[]; icon: string }> = [
        { match: ["amazon"], icon: "simple-icons:amazon" },
        { match: ["apple", "apple com", "apple.com"], icon: "simple-icons:apple" },
        { match: ["best buy", "bestbuy"], icon: "arcticons:bestbuy" },
        { match: ["chipotle"], icon: "simple-icons:chipotle" },
        { match: ["costco"], icon: "simple-icons:costco" },
        { match: ["disney"], icon: "cbi:disney-plus-alt" },
        { match: ["doordash"], icon: "simple-icons:doordash" },
        { match: ["ebay"], icon: "simple-icons:ebay" },
        { match: ["lyft"], icon: "simple-icons:lyft" },
        { match: ["mcdonalds", "mcdonald"], icon: "simple-icons:mcdonalds" },
        { match: ["netflix"], icon: "simple-icons:netflix" },
        { match: ["nike"], icon: "simple-icons:nike" },
        { match: ["safeway"], icon: "simple-icons:safeway" },
        { match: ["shell"], icon: "simple-icons:shell" },
        { match: ["spotify"], icon: "simple-icons:spotify" },
        { match: ["starbucks"], icon: "simple-icons:starbucks" },
        { match: ["target"], icon: "simple-icons:target" },
        { match: ["t mobile", "tmobile", "t-mobile"], icon: "simple-icons:t-mobile" },
        { match: ["uber"], icon: "simple-icons:uber" },
        { match: ["walmart"], icon: "simple-icons:walmart" },
        { match: ["youtube"], icon: "simple-icons:youtube" },
    ];

    const found = iconMap.find((entry) =>
        entry.match.some((term) => normalized.includes(term))
    );

    return found?.icon ?? null;
}

function getGridTemplate({
    showDate,
    showCategory,
    showAccount,
    showAmount,
}: {
    showDate: boolean;
    showCategory: boolean;
    showAccount: boolean;
    showAmount: boolean;
}) {
    const columns: string[] = [];

    if (showDate) columns.push("minmax(60px, 0.8fr)");
    columns.push("minmax(0, 2fr)");
    if (showCategory) columns.push("minmax(0, 1.15fr)");
    if (showAccount) columns.push("minmax(0, 1fr)");
    if (showAmount) columns.push("minmax(80px, 0.85fr)");

    return columns.join(" ");
}

function getVisiblePageItems(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
        return [
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
    ];
}

export default function ShowTransactions({
    transactions,
    className = "",
    limit = 10,
    newestFirst = true,
    showDate = false,
    showCategory = false,
    showAccount = false,
    showAmount = false,
    showIcon = true,
    pages = false,
    editCategory = false,
    showIncome = true,
}: ShowTransactionsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTx, setEditingTx] = useState<{
        id: string;
        categoryPath: string;
    } | null>(null);
    const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});

    const sortedTransactions = useMemo(() => {
        const filtered = transactions.filter((tx) => {
            if (!showIncome && isIncome(tx)) return false;
            return true;
        });

        return [...filtered].sort((a, b) => {
            const aTime = new Date(a.created_at || a.date || 0).getTime();
            const bTime = new Date(b.created_at || b.date || 0).getTime();

            return newestFirst ? bTime - aTime : aTime - bTime;
        });
    }, [transactions, newestFirst, showIncome]);

    const safeLimit = Math.max(1, limit);
    const totalPages = pages
        ? Math.max(1, Math.ceil(sortedTransactions.length / safeLimit))
        : 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [transactions, newestFirst, limit, pages, showIncome]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const displayedTransactions = useMemo(() => {
        if (!pages) {
            return sortedTransactions.slice(0, safeLimit);
        }

        const startIndex = (currentPage - 1) * safeLimit;
        const endIndex = startIndex + safeLimit;

        return sortedTransactions.slice(startIndex, endIndex);
    }, [sortedTransactions, pages, currentPage, safeLimit]);

    const gridTemplateColumns = getGridTemplate({
        showDate,
        showCategory,
        showAccount,
        showAmount,
    });

    const pageNumbers = getVisiblePageItems(currentPage, totalPages);

    return (
        <div className={`w-full max-w-full min-w-0 overflow-x-hidden ${className}`}>
            <div className="w-full min-w-0">
                <div className="hidden md:block">
                    <div
                        className="grid min-w-0 items-center gap-3 border-b border-white/10 px-4 py-3 text-sm text-white/70"
                        style={{ gridTemplateColumns }}
                    >
                        {showDate && <p className="truncate">Date</p>}
                        <p className="truncate">Name</p>
                        {showCategory && <p className="truncate">Category</p>}
                        {showAccount && <p className="truncate">Account</p>}
                        {showAmount && <p className="truncate text-right">Amount</p>}
                    </div>

                    <div className="flex min-w-0 flex-col">
                        {displayedTransactions.map((tx) => {
                            const txId = tx.id ?? tx.plaid_transaction_id ?? "";
                            const name = getDisplayName(tx);
                            const currentPath = categoryOverrides[txId] ?? getTransactionPath(tx);
                            const category = getDisplayLabelFromPath(currentPath);
                            const account = getDisplayAccount(tx);
                            const rawAmount = getRawAmount(tx);
                            const incomeLike = isIncome(tx);
                            const refundLike = !incomeLike && isRefundLike(tx);
                            const positiveAmount = incomeLike || refundLike;
                            const amountColor = positiveAmount ? "text-green-400" : "text-red-400";
                            const amountPrefix = positiveAmount ? "+" : "-";
                            const categoryColor = resolveColor(category.toLowerCase());
                            const categoryBg = hexToRgba(categoryColor, 0.22);
                            const merchantIcon = showIcon ? getMerchantIcon(name) : null;

                            return (
                                <div
                                    key={tx.id || tx.plaid_transaction_id || `${name}-${tx.created_at || tx.date}`}
                                    className="grid min-w-0 items-center gap-3 border-b border-white/10 px-4 py-4"
                                    style={{ gridTemplateColumns }}
                                >
                                    {showDate && (
                                        <p className="min-w-0 truncate text-white/80">
                                            {formatDate(tx.created_at || tx.date)}
                                        </p>
                                    )}

                                    <div className="flex min-w-0 items-center gap-3">
                                        {showIcon && (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/8">
                                                {merchantIcon ? (
                                                    <IconifyIcon icon={merchantIcon} width={18} height={18} />
                                                ) : (
                                                    <span className="text-xs text-white/60">
                                                        {name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <p className="min-w-0 truncate font-medium text-white">
                                            {name}
                                        </p>
                                    </div>

                                    {showCategory && (
                                        <div className="min-w-0">
                                            {editCategory ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!txId) return;
                                                        setEditingTx({
                                                            id: txId,
                                                            categoryPath: currentPath,
                                                        });
                                                    }}
                                                    className="
                                                        inline-flex max-w-full items-center 
                                                        rounded-md border px-2.5 py-1 text-sm 
                                                        text-white transition-colors hover:brightness-110
                                                        hover:cursor-pointer
                                                    "
                                                    style={{
                                                        backgroundColor: categoryBg,
                                                        borderColor: categoryColor,
                                                    }}
                                                    aria-label={`Edit category ${category}`}
                                                >
                                                    <span className="truncate">{category}</span>
                                                    <span className="ml-2 shrink-0 text-white/50">
                                                        <Icon name="pencil" />
                                                    </span>
                                                </button>
                                            ) : (
                                                <span
                                                    className="inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-sm text-white"
                                                    style={{
                                                        backgroundColor: categoryBg,
                                                        borderColor: categoryColor,
                                                    }}
                                                >
                                                    <span className="truncate">{category}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {showAccount && (
                                        <p className="min-w-0 truncate text-white/85">
                                            {account}
                                        </p>
                                    )}

                                    {showAmount && (
                                        <p className={`min-w-0 truncate text-right font-medium ${amountColor}`}>
                                            {amountPrefix}${Math.abs(rawAmount).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {displayedTransactions.length === 0 && (
                            <div className="px-4 py-6 text-white/60">
                                No transactions found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-hidden md:hidden">
                    <div className="flex min-w-0 flex-col">
                        {displayedTransactions.map((tx) => {
                            const txId = tx.id ?? tx.plaid_transaction_id ?? "";
                            const name = getDisplayName(tx);
                            const currentPath = categoryOverrides[txId] ?? getTransactionPath(tx);
                            const category = getDisplayLabelFromPath(currentPath);
                            const account = getDisplayAccount(tx);
                            const rawAmount = getRawAmount(tx);
                            const incomeLike = isIncome(tx);
                            const refundLike = !incomeLike && isRefundLike(tx);
                            const positiveAmount = incomeLike || refundLike;
                            const amountColor = positiveAmount ? "text-green-400" : "text-red-400";
                            const amountPrefix = positiveAmount ? "+" : "-";
                            const categoryColor = resolveColor(category.toLowerCase());
                            const categoryBg = hexToRgba(categoryColor, 0.22);
                            const merchantIcon = showIcon ? getMerchantIcon(name) : null;

                            return (
                                <div
                                    key={tx.id || tx.plaid_transaction_id || `${name}-${tx.created_at || tx.date}`}
                                    className="border-b border-white/10 px-4 py-4"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        {showIcon && (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/8">
                                                {merchantIcon ? (
                                                    <IconifyIcon icon={merchantIcon} width={18} height={18} />
                                                ) : (
                                                    <span className="text-xs text-white/60">
                                                        {name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <p className="min-w-0 flex-1 truncate font-medium text-white">
                                                    {name}
                                                </p>

                                                {showAmount && (
                                                    <p className={`max-w-[40%] shrink-0 truncate text-right font-medium ${amountColor}`}>
                                                        {amountPrefix}${Math.abs(rawAmount).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm text-white/70">
                                                {showDate && (
                                                    <span className="shrink-0">
                                                        {formatDate(tx.created_at || tx.date)}
                                                    </span>
                                                )}

                                                {showDate && showAccount && (
                                                    <p>/</p>
                                                )}

                                                {showAccount && (
                                                    <span className="min-w-0 max-w-full truncate">
                                                        {account}
                                                    </span>
                                                )}

                                                {showCategory &&
                                                    (editCategory ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!txId) return;
                                                                setEditingTx({
                                                                    id: txId,
                                                                    categoryPath: currentPath,
                                                                });
                                                            }}
                                                            className="inline-flex max-w-[200px] items-center rounded-md border px-2.5 py-1 text-sm text-white transition-colors hover:brightness-110"
                                                            style={{
                                                                backgroundColor: categoryBg,
                                                                borderColor: categoryColor,
                                                            }}
                                                            aria-label={`Edit category ${category}`}
                                                        >
                                                            <span className="truncate">{category}</span>
                                                            <span className="ml-2 shrink-0 text-white/50">
                                                                <Icon name="pencil" />
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className="inline-flex max-w-[200px] items-center rounded-md border px-2.5 py-1 text-sm text-white"
                                                            style={{
                                                                backgroundColor: categoryBg,
                                                                borderColor: categoryColor,
                                                            }}
                                                        >
                                                            <span className="truncate">{category}</span>
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {displayedTransactions.length === 0 && (
                            <div className="px-4 py-6 text-white/60">
                                No transactions found.
                            </div>
                        )}
                    </div>
                </div>

                {pages && totalPages > 1 && (
                    <div className="border-t border-white/10 px-3 py-4 sm:px-4">
                        <div className="flex min-w-0 flex-col items-center gap-2">
                            <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="
                                        inline-flex min-w-0 items-center gap-1 rounded-lg border border-white/10
                                        bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition
                                        hover:bg-white/[0.05] hover:text-white sm:px-3
                                        disabled:cursor-not-allowed disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft size={16} className="shrink-0" />
                                    <span className="truncate">Previous</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="
                                        inline-flex min-w-0 items-center gap-1 rounded-lg border border-white/10
                                        bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition
                                        hover:bg-white/[0.05] hover:text-white sm:px-3
                                        disabled:cursor-not-allowed disabled:opacity-40
                                    "
                                >
                                    <span className="truncate">Next</span>
                                    <ChevronRight size={16} className="shrink-0" />
                                </button>
                            </div>

                            <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
                                <div className="hidden sm:flex sm:items-center sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="
                                            inline-flex items-center gap-1 rounded-lg border border-white/10
                                            bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition
                                            hover:bg-white/[0.05] hover:text-white sm:px-3
                                            disabled:cursor-not-allowed disabled:opacity-40
                                        "
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                </div>

                                {pageNumbers[0] > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(1)}
                                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition hover:bg-white/[0.05] hover:text-white sm:px-3"
                                        >
                                            1
                                        </button>
                                        {pageNumbers[0] > 2 && (
                                            <span className="flex items-center justify-center px-1 text-white/50">
                                                <MoreHorizontal size={16} />
                                            </span>
                                        )}
                                    </>
                                )}

                                {pageNumbers.map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`rounded-lg border px-2.5 py-2 text-sm transition sm:px-3 ${
                                            page === currentPage
                                                ? "border-white/20 bg-white/[0.10] text-white"
                                                : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.05] hover:text-white"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                                    <>
                                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                            <span className="flex items-center justify-center px-1 text-white/50">
                                                <MoreHorizontal size={16} />
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition hover:bg-white/[0.05] hover:text-white sm:px-3"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <div className="hidden sm:flex sm:items-center sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="
                                            inline-flex items-center gap-1 rounded-lg border border-white/10
                                            bg-white/[0.03] px-2.5 py-2 text-sm text-white/80 transition
                                            hover:bg-white/[0.05] hover:text-white sm:px-3
                                            disabled:cursor-not-allowed disabled:opacity-40
                                        "
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {editingTx && (
                    <CategoryEditorModal
                        transactionId={editingTx.id}
                        currentCategory={editingTx.categoryPath}
                        onSave={(newCategoryPath) => {
                            setCategoryOverrides((prev) => ({
                                ...prev,
                                [editingTx.id]: newCategoryPath,
                            }));
                        }}
                        onClose={() => setEditingTx(null)}
                    />
                )}
            </div>
        </div>
    );
}