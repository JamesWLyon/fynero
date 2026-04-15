import { categorizeTransaction } from "./categorize";

function ensureNode(obj: any, key: string) {
    if (!obj[key]) {
        obj[key] = { total: 0 };
    }
}

function addToPath(root: any, path: string[], amount: number) {
    let current = root;

    for (const key of path) {
        ensureNode(current, key);
        current = current[key];
        current.total += amount;
    }
}

export function aggregateTransactions(transactions: any[]) {
    const result: any = {
        total: { total: 0 },
        income: { total: 0 },
        spent: { total: 0 },
    };

    const seen = new Set<string>();

    for (const tx of transactions) {
        if (seen.has(tx.id)) continue;
        seen.add(tx.id);

        const raw = Number(tx.amount);
        if (Number.isNaN(raw)) continue;

        const amount = Math.abs(raw);
        if (amount === 0) continue;

        const categorized = categorizeTransaction(tx);
        const { direction, path } = categorized;

        result.total.total += amount;

        addToPath(result, path, amount);

        if (direction === "income") {
            if (path[0] !== "income") {
                result.income.total += amount;
            }
            continue;
        }

        if (path[0] !== "spent") {
            result.spent.total += amount;
        }
    }

    return result;
}