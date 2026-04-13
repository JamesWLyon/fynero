import { CATEGORY_RULES } from "./categories";

type SubRule = {
  keywords: string[];
};

type CategoryRule = {
  keywords: string[];
  children?: Record<string, SubRule>;
};

type TopLevelRule = {
  keywords?: string[];
  plaid?: string[];
  children?: Record<string, CategoryRule>;
};

function matchKeywords(name: string, keywords?: string[]) {
  if (!keywords) return false;
  return keywords.some((k) => name.includes(k));
}

export function categorizeTransaction(tx: any) {
  const name = (tx.name || tx.description || "").toLowerCase();
  const plaidPrimary = tx.personal_finance_category?.primary || "";

  // Check Income / Savings / Debt first
  for (const [key, rule] of Object.entries(CATEGORY_RULES) as [string, TopLevelRule][]) {
    if (rule.keywords && matchKeywords(name, rule.keywords)) {
      return { main: key, category: key, sub: null };
    }
    if (rule.plaid && rule.plaid.includes(plaidPrimary)) {
      return { main: key, category: key, sub: null };
    }
  }

  // Handle Expenses tree
  const expenses = CATEGORY_RULES.expenses;

  for (const [catName, catRule] of Object.entries(expenses.children) as [string, CategoryRule][]) {
    if (matchKeywords(name, catRule.keywords)) {

      // Check sub-categories (like subscriptions)
      if (catRule.children) {
        for (const [subName, subRule] of Object.entries(catRule.children) as [string, SubRule][]) {
          if (matchKeywords(name, subRule.keywords)) {
            return { main: "expenses", category: catName, sub: subName };
          }
        }
      }

      return { main: "expenses", category: catName, sub: null };
    }
  }

  // Fallback to Plaid
  return {
    main: "expenses",
    category: plaidPrimary || "other",
    sub: tx.personal_finance_category?.detailed || null,
  };
}