export type Transaction = {
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

export type TransactionToolbarFilters = {
    search: string;
    startDate: string;
    endDate: string;
    category: string;
    account: string;
    newestFirst: boolean;
    minAmount: string;
    maxAmount: string;
    includeRefunds: boolean;
};

function normalizeText(value: string) {
    return (value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s&+.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function getTransactionDate(tx: Transaction) {
    const raw = tx.created_at || tx.date;
    if (!raw) return null;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;

    return date;
}

export function getDisplayName(tx: Transaction) {
    return tx.description || tx.name || "Unknown transaction";
}

export function getDisplayCategory(tx: Transaction) {
    return tx.sub_category || tx.category || "other";
}

export function getDisplayAccount(tx: Transaction) {
    if (tx.account_display_name) return tx.account_display_name;
    if (tx.account_name) return tx.account_name;
    if (tx.account) return tx.account;
    if (tx.account_mask) return `•••• ${tx.account_mask}`;
    return "Unknown";
}

export function getRawAmount(tx: Transaction) {
    return Number(tx.amount || 0);
}

export function isRefundLike(tx: Transaction) {
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
        "credit back",
        "money back",
    ].some((term) => name.includes(term));
}

export function isSpendingTransaction(tx: Transaction) {
    const type = (tx.type || "").toLowerCase();
    return type !== "income";
}

function matchesSearch(tx: Transaction, search: string) {
    if (!search.trim()) return true;

    const term = normalizeText(search);
    if (!term) return true;

    const haystack = normalizeText(
        [getDisplayName(tx), getDisplayCategory(tx), getDisplayAccount(tx)].join(" ")
    );

    return haystack.includes(term);
}

function matchesDateRange(tx: Transaction, startDate: string, endDate: string) {
    if (!startDate && !endDate) return true;

    const txDate = getTransactionDate(tx);
    if (!txDate) return false;

    const txTime = txDate.getTime();

    if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (Number.isNaN(start.getTime())) return false;
        if (txTime < start.getTime()) return false;
    }

    if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999`);
        if (Number.isNaN(end.getTime())) return false;
        if (txTime > end.getTime()) return false;
    }

    return true;
}

function matchesCategory(tx: Transaction, category: string) {
    if (!category) return true;

    return normalizeText(getDisplayCategory(tx)) === normalizeText(category);
}

function matchesAccount(tx: Transaction, account: string) {
    if (!account) return true;

    return normalizeText(getDisplayAccount(tx)) === normalizeText(account);
}

function matchesAmountRange(tx: Transaction, minAmount: string, maxAmount: string) {
    if (!minAmount && !maxAmount) return true;

    const amount = Math.abs(getRawAmount(tx));

    if (minAmount !== "") {
        const min = Number(minAmount);
        if (!Number.isNaN(min) && amount < min) return false;
    }

    if (maxAmount !== "") {
        const max = Number(maxAmount);
        if (!Number.isNaN(max) && amount > max) return false;
    }

    return true;
}

function matchesRefundToggle(tx: Transaction, includeRefunds: boolean) {
    if (includeRefunds) return true;
    return !isRefundLike(tx);
}

export function sortTransactions(
    transactions: Transaction[],
    newestFirst = true
) {
    return [...transactions].sort((a, b) => {
        const aTime = getTransactionDate(a)?.getTime() ?? 0;
        const bTime = getTransactionDate(b)?.getTime() ?? 0;

        return newestFirst ? bTime - aTime : aTime - bTime;
    });
}

export function filterTransactions(
    transactions: Transaction[],
    filters: TransactionToolbarFilters
) {
    const spendingOnly = transactions.filter(isSpendingTransaction);

    const filtered = spendingOnly.filter((tx) => {
        return (
            matchesSearch(tx, filters.search) &&
            matchesDateRange(tx, filters.startDate, filters.endDate) &&
            matchesCategory(tx, filters.category) &&
            matchesAccount(tx, filters.account) &&
            matchesRefundToggle(tx, filters.includeRefunds) &&
            matchesAmountRange(tx, filters.minAmount, filters.maxAmount)
        );
    });

    return sortTransactions(filtered, filters.newestFirst);
}

export function getDefaultTransactionToolbarFilters(): TransactionToolbarFilters {
    return {
        search: "",
        startDate: "",
        endDate: "",
        category: "",
        account: "",
        newestFirst: true,
        minAmount: "",
        maxAmount: "",
        includeRefunds: false,
    };
}