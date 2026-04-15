export const CATEGORY_RULES = {
    income: {
        keywords: ["payroll", "salary", "deposit", "income"],
        plaid: ["INCOME"],
    },

    spent: {
        children: {
            savings: {
                keywords: [
                  "transfer", 
                  "savings"
                ],
                plaid: ["TRANSFER"],
            },

            debt: {
                keywords: [
                  "loan", 
                  "credit card", 
                  "payment"
                ],
                plaid: ["LOAN_PAYMENTS", "CREDIT_CARD_PAYMENT"],
            },

            expenses: {
                children: {
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
                                  "disney"
                                ],
                            },
                        },
                    },
                    food: {
                        keywords: [
                          "mcdonald", 
                          "starbucks", 
                          "chipotle", 
                          "restaurant", 
                          "cafe"
                        ],
                    },
                    shopping: {
                        keywords: [
                          "amazon", 
                          "walmart", 
                          "target"
                        ],
                    },
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
        },
    },
};

export function getChildKeys(parent: string): string[] {
    const keys = parent.split(".");
    let node: any = CATEGORY_RULES;
    for (const key of keys) {
        node = node[key];
    }
    if (node?.children) {
        return Object.keys(node.children).map((k) => `${parent}.${k}`);
    }
    return [parent];
}