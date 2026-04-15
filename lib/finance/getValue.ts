export function getValue(data: any, path: string): number {
    if (!data) return 0;

    const keys = path.split(".");
    let current = data;

    for (const key of keys) {
        if (current?.[key] === undefined) return 0;
        current = current[key];
    }

    if (typeof current === "object" && current !== null) {
        if ("total" in current) {
            return Math.round(current.total * 100) / 100;
        }
        return 0;
    }

    return Math.round((current || 0) * 100) / 100;
}