import { categorizeTransaction } from "./categorize";

function ensureNode(obj: any, key: string) {
    if (!obj[key]) obj[key] = { total: 0 };
}

export function aggregateTransactions(transactions: any[]) {
    const result: any = {
        total:    { total: 0 },
        income:   { total: 0 },
        spending: { total: 0 },
        savings:  { total: 0 },
        debt:     { total: 0 },
        expenses: { total: 0 },
        unknown:  { total: 0 },
    };

    transactions.forEach((tx) => {
        const raw = Number(tx.amount) || 0;
        const isIncome = raw < 0;
        const amount = Math.abs(raw);

        result.total.total += amount;

        // If negative amount → always income, skip categorizer
        if (isIncome) {
            result.income.total += amount;
            return;
        }

        // everything that isn't income
        result.spending.total += amount;

        // Positive amount → run through categorizer as normal
        const normalizedTx = { ...tx, name: tx.name || tx.description || "" };
        const { main, category, sub } = categorizeTransaction(normalizedTx);

        ensureNode(result, main);
        result[main].total += amount;

        if (category && category !== main) {
            ensureNode(result[main], category);
            result[main][category].total += amount;

            if (sub) {
                ensureNode(result[main][category], sub);
                result[main][category][sub].total += amount;
            }
        }
    });

    return result;
}