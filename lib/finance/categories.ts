export const CATEGORY_RULES = {
  // 🟢 INCOME
  income: {
    keywords: [
        "payroll", 
        "salary", 
        "deposit", 
        "income"
    ],
    plaid: ["INCOME"],
  },

  // 🔵 SAVINGS / TRANSFERS
  savings: {
    keywords: [
        "transfer",
        "savings"
    ],
    plaid: ["TRANSFER"],
  },

  // 🟡 DEBT
  debt: {
    keywords: ["loan", "credit card", "payment"],
    plaid: ["LOAN_PAYMENTS", "CREDIT_CARD_PAYMENT"],
  },

  // 🔴 EXPENSES (main bucket)
  expenses: {
    children: {
      // Bills
      bills: {
        keywords: [
            "rent", 
            "utility", 
            "internet", 
            "electric"
        ],
        children: {
          subscriptions: {
            keywords: [
              "netflix",
              "spotify",
              "hulu",
              "apple.com/bill",
              "disney",
            ],
          },
        },
      },

      // Food
      food: {
        keywords: [
          "mcdonald",
          "starbucks",
          "chipotle",
          "restaurant",
          "cafe",
        ],
      },

      // Shopping
      shopping: {
        keywords: [
            "amazon",
             "walmart", 
             "target",
            ],
      },

      // Transport
      transport: {
        keywords: [
            "uber", 
            "lyft", 
            "gas", 
            "shell", 
            "chevron"
        ],
      },
    },
  },
};