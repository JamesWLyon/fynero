export const CATEGORY_RULES = {
    income: {
        keywords: [
            "income",
            "payroll",
            "salary",
            "deposit",
            "direct deposit",
            "paycheck",
            "wages",
            "bonus",
            "commission",
            "reimbursement",
            "refund",
            "payout",
        ],
        phrases: [
            "direct deposit",
            "salary deposit",
            "payroll deposit",
            "bonus payout",
            "paycheck deposit",
            "employer deposit",
        ],
        plaid: ["INCOME"],
    },

    spent: {
        children: {
            savings: {
                keywords: [
                    "savings",
                    "transfer",
                    "save",
                ],
                phrases: [
                    "transfer to savings",
                    "savings transfer",
                    "automatic savings",
                ],
                plaid: ["TRANSFER"],
            },

            debt: {
                keywords: [
                    "loan",
                    "credit card",
                    "payment",
                    "debt",
                    "installment",
                    "financing",
                ],
                phrases: [
                    "credit card payment",
                    "loan payment",
                    "card payment",
                    "debt payment",
                    "installment payment",
                ],
                plaid: ["LOAN_PAYMENTS", "CREDIT_CARD_PAYMENT"],
            },

            expenses: {
                children: {
                    bills: {
                        keywords: [
                            "bill",
                            "utility",
                            "utilities",
                            "internet",
                            "electric",
                            "electricity",
                            "water",
                            "power",
                            "gas bill",
                            "rent",
                            "lease",
                            "phone",
                            "insurance",
                        ],
                        children: {
                            subscriptions: {
                                keywords: [
                                    "subscription",
                                    "streaming",
                                    "membership",
                                    "netflix",
                                    "spotify",
                                    "hulu",
                                    "disney",
                                    "youtube",
                                    "apple.com",
                                    "apple bill",
                                    "prime",
                                ],
                                phrases: [
                                    "apple.com bill",
                                    "monthly subscription",
                                    "annual subscription",
                                    "streaming subscription",
                                    "recurring membership",
                                ],
                            },

                            utilities: {
                                keywords: [
                                    "internet",
                                    "electric",
                                    "electricity",
                                    "utility",
                                    "utilities",
                                    "water",
                                    "power",
                                    "phone",
                                    "insurance",
                                ],
                                phrases: [
                                    "internet bill",
                                    "electric bill",
                                    "utility bill",
                                    "phone bill",
                                    "insurance bill",
                                ],
                            },

                            rent: {
                                keywords: [
                                    "rent",
                                    "lease",
                                    "landlord",
                                ],
                                phrases: [
                                    "rent payment",
                                    "monthly rent",
                                    "lease payment",
                                ],
                            },
                        },
                    },

                    food: {
                        keywords: [
                            "food",
                            "restaurant",
                            "cafe",
                            "coffee",
                            "grocery",
                            "groceries",
                            "supermarket",
                            "deli",
                            "bakery",
                            "mcdonalds",
                            "chipotle",
                            "starbucks",
                            "doordash",
                            "ubereats",
                        ],
                        children: {
                            restaurants: {
                                keywords: [
                                    "restaurant",
                                    "fast food",
                                    "takeout",
                                    "delivery",
                                    "mcdonalds",
                                    "chipotle",
                                    "doordash",
                                    "ubereats",
                                ],
                                phrases: [
                                    "restaurant purchase",
                                    "food delivery",
                                    "takeout order",
                                ],
                            },

                            coffee: {
                                keywords: [
                                    "coffee",
                                    "cafe",
                                    "espresso",
                                    "starbucks",
                                ],
                                phrases: [
                                    "coffee shop",
                                    "coffee purchase",
                                ],
                            },

                            groceries: {
                                keywords: [
                                    "grocery",
                                    "groceries",
                                    "supermarket",
                                    "market",
                                    "walmart",
                                    "costco",
                                    "aldi",
                                    "kroger",
                                    "safeway",
                                    "trader joe",
                                ],
                                phrases: [
                                    "grocery store",
                                    "supermarket purchase",
                                    "grocery run",
                                ],
                            },
                        },
                    },

                    shopping: {
                        keywords: [
                            "shopping",
                            "store",
                            "retail",
                            "marketplace",
                            "online order",
                            "department store",
                            "amazon",
                            "target",
                            "walmart",
                            "best buy",
                            "ebay",
                        ],
                        children: {
                            retail: {
                                keywords: [
                                    "retail",
                                    "store",
                                    "marketplace",
                                    "amazon",
                                    "target",
                                    "walmart",
                                    "ebay",
                                ],
                                phrases: [
                                    "retail purchase",
                                    "online order",
                                    "online purchase",
                                ],
                            },

                            electronics: {
                                keywords: [
                                    "electronics",
                                    "computer",
                                    "tech",
                                    "best buy",
                                    "apple",
                                ],
                                phrases: [
                                    "electronics purchase",
                                    "tech purchase",
                                ],
                            },
                        },
                    },

                    transport: {
                        keywords: [
                            "transport",
                            "uber",
                            "lyft",
                            "rideshare",
                            "gas",
                            "fuel",
                            "shell",
                            "chevron",
                            "exxon",
                            "mobil",
                            "texaco",
                            "circle k",
                            "sinclair",
                            "arco",
                            "bp",
                            "phillips 66",
                            "76",
                        ],
                        children: {
                            rideshare: {
                                keywords: [
                                    "uber",
                                    "lyft",
                                    "rideshare",
                                    "taxi",
                                ],
                                phrases: [
                                    "ride share",
                                    "ride fare",
                                ],
                            },

                            fuel: {
                                keywords: [
                                    "gas",
                                    "fuel",
                                    "shell",
                                    "chevron",
                                    "exxon",
                                    "mobil",
                                    "texaco",
                                    "circle k",
                                    "sinclair",
                                    "arco",
                                    "bp",
                                    "phillips 66",
                                    "76",
                                ],
                                phrases: [
                                    "gas station",
                                    "fuel purchase",
                                    "fuel stop",
                                ],
                            },
                        },
                    },

                    personal: {
                        keywords: [
                            "personal",
                            "gym",
                            "fitness",
                            "membership",
                            "climbing",
                            "beauty",
                            "salon",
                            "barber",
                            "self care",
                            "wellness",
                        ],
                        phrases: [
                            "gym membership",
                            "climbing gym",
                            "personal care",
                            "fitness membership",
                            "self care purchase",
                        ],
                    },

                    other: {
                        keywords: [],
                        phrases: [],
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
        node = node?.[key];
        if (!node) return [parent];
    }

    if (node?.children) {
        return Object.keys(node.children).map((k) => `${parent}.${k}`);
    }

    return [parent];
}