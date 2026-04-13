export function filterByTime(transactions: any[], query?: string) {
    if (!query || query === "all") return transactions;

    const now = new Date();

    return transactions.filter((tx) => {
        const raw = tx.date || tx.created_at;
        if (!raw) return false;

        const date = new Date(raw);
        if (isNaN(date.getTime())) return false;

        // DAY
        if (query.startsWith("day")) {
            if (query === "day:previous") {
                const yesterday = new Date(now);
                yesterday.setUTCDate(now.getUTCDate() - 1);
                return (
                    date.getUTCDate() === yesterday.getUTCDate() &&
                    date.getUTCMonth() === yesterday.getUTCMonth() &&
                    date.getUTCFullYear() === yesterday.getUTCFullYear()
                );
            }
            if (!query.includes(":")) {
                return (
                    date.getUTCDate() === now.getUTCDate() &&
                    date.getUTCMonth() === now.getUTCMonth() &&
                    date.getUTCFullYear() === now.getUTCFullYear()
                );
            }
            const [, value] = query.split(":");
            const target = new Date(value);
            return (
                date.getUTCDate() === target.getUTCDate() &&
                date.getUTCMonth() === target.getUTCMonth() &&
                date.getUTCFullYear() === target.getUTCFullYear()
            );
        }

        // MONTH
        if (query.startsWith("month")) {
            if (query === "month:previous") {
                const prevMonth = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1;
                const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
                return (
                    date.getUTCMonth() === prevMonth &&
                    date.getUTCFullYear() === prevYear
                );
            }
            if (!query.includes(":")) {
                return (
                    date.getUTCMonth() === now.getUTCMonth() &&
                    date.getUTCFullYear() === now.getUTCFullYear()
                );
            }
            const [, value] = query.split(":");
            const monthNames = [
                "january","february","march","april","may","june",
                "july","august","september","october","november","december"
            ];
            const monthIndex = monthNames.indexOf(value.toLowerCase());
            return (
                date.getUTCMonth() === monthIndex &&
                date.getUTCFullYear() === now.getUTCFullYear()
            );
        }

        // YEAR
        if (query.startsWith("year")) {
            if (query === "year:previous") {
                return date.getUTCFullYear() === now.getUTCFullYear() - 1;
            }
            if (!query.includes(":")) {
                return date.getUTCFullYear() === now.getUTCFullYear();
            }
            const [, value] = query.split(":");
            return date.getUTCFullYear() === Number(value);
        }

        return true;
    });
}