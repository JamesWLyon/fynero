export function getValue(data: any, path: string): number {
    if (!data || !path) return 0;

    const keys = path.split(".").filter(Boolean);
    let current = data;

    for (const key of keys) {
        if (current == null || current[key] === undefined) {
            return 0;
        }

        current = current[key];
    }

    if (typeof current === "number") {
        return Math.round(current * 100) / 100;
    }

    if (typeof current === "object" && current !== null) {
        if (typeof current.total === "number") {
            return Math.round(current.total * 100) / 100;
        }

        return 0;
    }

    return 0;
}