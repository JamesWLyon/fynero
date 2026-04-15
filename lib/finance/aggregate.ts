import { categorizeTransaction } from "./categorize";

function ensureNode(obj: any, key: string) {
    if (!obj[key]) obj[key] = { total: 0 };
}

export function aggregateTransactions(transactions: any[]) {
    const result: any = {
        total:  { total: 0 },
        income: { total: 0 },
        spent:  { total: 0 },
    };

    const seen = new Set();

    for (const tx of transactions) {
        if (seen.has(tx.id)) continue;
        seen.add(tx.id);

        const raw = Number(tx.amount) || 0;
        const amount = Math.abs(raw);

        result.total.total += amount;

        const { main, category, sub } = categorizeTransaction(tx);

        if (main === "income") {
            result.income.total += amount;

            if (category !== "income") {
                ensureNode(result.income, category);
                result.income[category].total += amount;
            }

            continue;
        }

        result.spent.total += amount;

        ensureNode(result.spent, category);
        result.spent[category].total += amount;

        if (sub) {
            ensureNode(result.spent[category], sub);
            result.spent[category][sub].total += amount;
        }
    }

    return result;
}