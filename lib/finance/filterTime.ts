export function filterByTime(transactions: any[], query?: string) {
    if (!query || query === "all") return transactions;

    const now = new Date();

    return transactions.filter((tx) => {
        // use whichever date field exists
        const raw = tx.date || tx.created_at;
        if (!raw) return false;

        // parse safely — handles both "2026-04-13" and "2026-04-13T06:35:19.465494"
        const date = new Date(raw);
        if (isNaN(date.getTime())) return false;

        if (query.startsWith("day")) {
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

        if (query.startsWith("month")) {
            if (!query.includes(":")) {
                return (
                    date.getUTCMonth() === now.getUTCMonth() &&
                    date.getUTCFullYear() === now.getUTCFullYear()
                );
            }
            const [, value] = query.split(":");
            const monthNames = [
                "january","february","march","april","may","june", "july","august","september","october","november","december"
            ];
            const monthIndex = monthNames.indexOf(value.toLowerCase());
            return (
                date.getUTCMonth() === monthIndex &&
                date.getUTCFullYear() === now.getUTCFullYear()
            );
        }

        if (query.startsWith("year")) {
            if (!query.includes(":")) {
                return date.getUTCFullYear() === now.getUTCFullYear();
            }
            const [, value] = query.split(":");
            return date.getUTCFullYear() === Number(value);
        }

        return true;
    });
}