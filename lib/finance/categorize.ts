import { CATEGORY_RULES } from "./categories";

function matchKeywords(name: string, keywords?: string[]) {
    if (!keywords) return false;
    return keywords.some((k) => name.includes(k));
}

export function categorizeTransaction(tx: any) {
    const name = (tx.name || tx.description || "").toLowerCase();
    const amount = Number(tx.amount);
    const plaidPrimary = tx.personal_finance_category?.primary || "";

    if (
      name.includes("credit card") ||
      name.includes("payment") ||
      name.includes("loan") ||
      plaidPrimary === "LOAN_PAYMENTS" ||
      plaidPrimary === "CREDIT_CARD_PAYMENT"
    ) {
      return { main: "spent", category: "debt", sub: null };
    }

    // INCOME
    if (
        plaidPrimary === "INCOME" ||
        matchKeywords(name, CATEGORY_RULES.income.keywords) ||
        (amount > 0 && (
            name.includes("deposit") ||
            name.includes("pay") ||
            name.includes("salary") ||
            name.includes("payroll")
        ))
    ) {
        return { main: "income", category: "income", sub: null };
    }

    // REFUNDS
    if (name.includes("intrst") || name.includes("interest")) {
      return { main: "income", category: "income", sub: null };
    }

    if (
      amount < 0 &&
      !name.includes("intrst") &&
      !name.includes("interest") &&
      plaidPrimary !== "INCOME"
    ) {
      return { main: "income", category: "refund", sub: null };
    }

    // SAVINGS
    const savings = CATEGORY_RULES.spent.children.savings;
    if (
        matchKeywords(name, savings.keywords) ||
        savings.plaid.includes(plaidPrimary)
    ) {
        return { main: "spent", category: "savings", sub: null };
    }

    // DEBT
    const debt = CATEGORY_RULES.spent.children.debt;
    if (
        matchKeywords(name, debt.keywords) ||
        debt.plaid.includes(plaidPrimary)
    ) {
        return { main: "spent", category: "debt", sub: null };
    }

    // EXPENSES
    const expenses = CATEGORY_RULES.spent.children.expenses;

    for (const [catName, catRule] of Object.entries(expenses.children as Record<string, any>)) {
        if (matchKeywords(name, catRule.keywords)) {

            if (catRule.children) {
                for (const [subName, subRule] of Object.entries(catRule.children as Record<string, any>)) {
                    if (matchKeywords(name, subRule.keywords)) {
                        return { main: "spent", category: "expenses", sub: catName };
                    }
                }
            }

            return { main: "spent", category: "expenses", sub: catName };
        }
    }

    // fallback
    return {
        main: "spent",
        category: "expenses",
        sub: plaidPrimary || "other",
    };
}