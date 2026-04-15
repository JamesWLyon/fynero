export const chartColors: Record<string, string> = {
    // Budget
    budget:        "#ffc400", // yellow

    // Spent
    spent:         "#cf6060", // light red

    // Bills
    subscriptions: "#6366f1", // indigo
    expenses:      "#f59e0b", // amber
    bills:         "#3b82f6", // blue

    // Debt
    debt:          "#ef4444", // red
    loan:          "#dc2626", // darker red
    mortgage:      "#b91c1c", // deep red

    // Income
    income:        "#10b981", // emerald
    salary:        "#059669", // green
    bonus:         "#34d399", // light green

    // Savings
    savings:       "#8b5cf6", // violet
    investment:    "#7c3aed", // purple

    // Misc
    food:          "#f97316", // orange
    transport:     "#14b8a6", // teal
    health:        "#06b6d4", // cyan

    // Fallback (used when colorKey isn't in the map)
    default:       "#94a3b8", // slate gray
};

/** Resolve a color for a given colorKey, falling back to default. */
export function resolveColor(colorKey: string): string {
    return chartColors[colorKey.toLowerCase()] ?? chartColors.default;
}