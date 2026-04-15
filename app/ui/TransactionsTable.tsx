"use client";

import { useMemo } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { resolveColor } from "@/app/config/chartColors";

type Transaction = {
    id?: string;
    plaid_transaction_id?: string;
    date?: string;
    created_at?: string;
    name?: string;
    description?: string;
    category?: string | null;
    sub_category?: string | null;
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

function getDisplayCategory(tx: Transaction) {
    return tx.sub_category || tx.category || "other";
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
}: ShowTransactionsProps) {
    const displayedTransactions = useMemo(() => {
        const filtered = transactions.filter((tx) => {
            const type = (tx.type || "").toLowerCase();

            return type !== "income";
        });

        const sorted = [...filtered].sort((a, b) => {
            const aTime = new Date(a.created_at || a.date || 0).getTime();
            const bTime = new Date(b.created_at || b.date || 0).getTime();

            return newestFirst ? bTime - aTime : aTime - bTime;
        });

        return sorted.slice(0, limit);
    }, [transactions, limit, newestFirst]);

    const gridTemplateColumns = getGridTemplate({
        showDate,
        showCategory,
        showAccount,
        showAmount,
    });

    return (
        <div className={`w-full min-w-0 ${className}`}>
            <div className="w-full min-w-0">
                <div
                    className="grid gap-3 px-4 py-3 text-sm text-white/70 border-b border-white/10 items-center"
                    style={{ gridTemplateColumns }}
                >
                    {showDate && <p className="truncate">Date</p>}
                    <p className="truncate">Name</p>
                    {showCategory && <p className="truncate">Category</p>}
                    {showAccount && <p className="truncate">Account</p>}
                    {showAmount && <p className="text-right truncate">Amount</p>}
                </div>

                <div className="flex flex-col">
                    {displayedTransactions.map((tx) => {
                        const name = getDisplayName(tx);
                        const category = getDisplayCategory(tx);
                        const account = getDisplayAccount(tx);
                        const rawAmount = getRawAmount(tx);
                        const refundLike = isRefundLike(tx);
                        const amountColor = refundLike ? "text-green-400" : "text-red-400";
                        const amountPrefix = refundLike ? "+" : "-";
                        const categoryColor = resolveColor(category);
                        const categoryBg = hexToRgba(categoryColor, 0.22);
                        const merchantIcon = showIcon ? getMerchantIcon(name) : null;

                        return (
                            <div
                                key={tx.id || tx.plaid_transaction_id || `${name}-${tx.created_at || tx.date}`}
                                className="grid gap-3 px-4 py-4 border-b border-white/10 items-center min-w-0"
                                style={{ gridTemplateColumns }}
                            >
                                {showDate && (
                                    <p className="text-white/80 truncate">
                                        {formatDate(tx.created_at || tx.date)}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 min-w-0">
                                    {showIcon && (
                                        <div className="w-8 h-8 shrink-0 rounded-md bg-white/8 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {merchantIcon ? (
                                                <IconifyIcon icon={merchantIcon} width={18} height={18} />
                                            ) : (
                                                <span className="text-xs text-white/60">
                                                    {name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-white font-medium truncate min-w-0">
                                        {name}
                                    </p>
                                </div>

                                {showCategory && (
                                    <div className="min-w-0">
                                        <span
                                            className="inline-flex max-w-full items-center rounded-md px-2.5 py-1 text-sm text-white border truncate"
                                            style={{
                                                backgroundColor: categoryBg,
                                                borderColor: categoryColor,
                                            }}
                                        >
                                            {category}
                                        </span>
                                    </div>
                                )}

                                {showAccount && (
                                    <p className="text-white/85 truncate min-w-0">
                                        {account}
                                    </p>
                                )}

                                {showAmount && (
                                    <p className={`text-right font-medium truncate ${amountColor}`}>
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
        </div>
    );
}