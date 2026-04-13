import { aggregateTransactions } from "./aggregate";
import { filterByTime } from "./filterTime";

export function getValue(
    transactions: any[],
    path: string,
    timeQuery: string = "all"
): number {
    if (!transactions || transactions.length === 0) return 0;

    const filtered = filterByTime(transactions, timeQuery);
    const data = aggregateTransactions(filtered);

    const keys = path.split(".");
    let current = data;

    for (const key of keys) {
        if (current[key] === undefined) return 0;
        current = current[key];
    }

    if (typeof current === "object" && current !== null) {
        if ("total" in current) return Math.round(current.total * 100) / 100; // ← fix
        return 0;
    }

    return Math.round((current || 0) * 100) / 100;
}