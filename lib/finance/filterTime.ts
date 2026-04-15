import { TimeFilter } from "./TimeFilter";

function getValidDate(raw: any) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isSameUtcDay(a: Date, b: Date) {
    return (
        a.getUTCDate() === b.getUTCDate() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCFullYear() === b.getUTCFullYear()
    );
}

function isSameUtcMonth(a: Date, month: number, year: number) {
    return a.getUTCMonth() + 1 === month && a.getUTCFullYear() === year;
}

function isSameUtcYear(a: Date, year: number) {
    return a.getUTCFullYear() === year;
}

function getPreviousUtcMonthYear(now: Date) {
    const month = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth();
    const year = now.getUTCMonth() === 0
        ? now.getUTCFullYear() - 1
        : now.getUTCFullYear();

    return { month, year };
}

export function filterByTime(transactions: any[], query?: TimeFilter) {
    if (!query || query === "all") {
        return transactions;
    }

    if (typeof query === "object" && query !== null) {
        return transactions.filter((tx) => {
            const raw = tx.date || tx.created_at;
            const date = getValidDate(raw);
            if (!date) return false;

            if (query.month && query.year) {
                return isSameUtcMonth(date, query.month, query.year);
            }

            if (query.year) {
                return isSameUtcYear(date, query.year);
            }

            return true;
        });
    }

    const now = new Date();

    return transactions.filter((tx) => {
        const raw = tx.date || tx.created_at;
        const date = getValidDate(raw);
        if (!date) return false;

        if (query.startsWith("day")) {
            if (query === "day:previous") {
                const previousDay = new Date(now);
                previousDay.setUTCDate(previousDay.getUTCDate() - 1);
                return isSameUtcDay(date, previousDay);
            }

            if (!query.includes(":")) {
                return isSameUtcDay(date, now);
            }

            const [, value] = query.split(":");
            const target = getValidDate(value);
            if (!target) return false;

            return isSameUtcDay(date, target);
        }

        if (query.startsWith("month")) {
            if (query === "month:previous") {
                const { month, year } = getPreviousUtcMonthYear(now);
                return isSameUtcMonth(date, month, year);
            }

            if (!query.includes(":")) {
                return isSameUtcMonth(date, now.getUTCMonth() + 1, now.getUTCFullYear());
            }

            const [, value] = query.split(":");

            const monthNames = [
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "july",
                "august",
                "september",
                "october",
                "november",
                "december",
            ];

            const monthIndex = monthNames.indexOf(value.toLowerCase());
            if (monthIndex === -1) return false;

            return isSameUtcMonth(date, monthIndex + 1, now.getUTCFullYear());
        }

        if (query.startsWith("year")) {
            if (query === "year:previous") {
                return isSameUtcYear(date, now.getUTCFullYear() - 1);
            }

            if (!query.includes(":")) {
                return isSameUtcYear(date, now.getUTCFullYear());
            }

            const [, value] = query.split(":");
            const year = Number(value);
            if (Number.isNaN(year)) return false;

            return isSameUtcYear(date, year);
        }

        return true;
    });
}