export const chartColors: Record<string, string> = {
    // Budget / totals
    budget: "#ffc400",        // yellow
    spent: "#cf6060",         // light red
    expenses: "#f59e0b",      // amber
    income: "#10b981",        // emerald
    savings: "#8b5cf6",       // violet
    debt: "#ef4444",          // red

    // Income subtypes
    salary: "#059669",        // green
    bonus: "#34d399",         // light green
    paycheck: "#22c55e",      // bright green
    wages: "#16a34a",         // medium green
    commission: "#6ee7b7",    // mint green
    reimbursement: "#2dd4bf", // aqua green
    payout: "#4ade80",        // soft green

    // Savings / debt related
    investment: "#7c3aed",    // purple
    loan: "#dc2626",          // darker red
    mortgage: "#b91c1c",      // deep red
    installment: "#991b1b",   // dark crimson
    financing: "#7f1d1d",     // very dark red

    // Expense categories
    bills: "#3b82f6",         // blue
    food: "#f97316",          // orange
    shopping: "#eab308",      // gold
    transport: "#14b8a6",     // teal
    personal: "#ec4899",      // pink
    other: "#94a3b8",         // slate gray 

    // Bills subcategories
    subscriptions: "#6366f1", // indigo
    utilities: "#0ea5e9",     // sky blue
    rent: "#1d4ed8",          // deep blue

    // Food subcategories
    restaurants: "#fb923c",   // light orange
    coffee: "#c084fc",        // lavender
    groceries: "#84cc16",     // lime green

    // Shopping subcategories
    retail: "#facc15",        // bright yellow
    electronics: "#f43f5e",   // rose red

    // Transport subcategories
    rideshare: "#06b6d4",     // cyan
    fuel: "#0f766e",          // dark teal

    // Legacy / misc compatibility
    health: "#06b6d4",        // cyan
    default: "#94a3b8",       // slate gray
};

/** Resolve a color for a given colorKey, falling back to default. */
export function resolveColor(colorKey: string): string {
    return chartColors[colorKey.toLowerCase()] ?? chartColors.default;
}