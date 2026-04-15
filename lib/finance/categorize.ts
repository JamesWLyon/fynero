import { CATEGORY_RULES } from "./categories";

type Direction = "income" | "expense";

type CategorizedResult = {
    direction: Direction;
    path: string[];
    confidence: number;
    reason: string;
};

type MatchResult = {
    path: string[];
    score: number;
    reason: string;
};

function normalize(str: string) {
    return (str || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s/&.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function splitWords(str: string) {
    return normalize(str).split(" ").filter(Boolean);
}

function hasWholeWord(words: string[], keyword: string) {
    const normalized = normalize(keyword);
    if (!normalized) return false;
    return words.includes(normalized);
}

function countKeywordHits(name: string, words: string[], keywords?: string[]) {
    if (!keywords?.length) return 0;

    let score = 0;

    for (const keyword of keywords) {
        const key = normalize(keyword);
        if (!key) continue;

        if (name === key) {
            score += 10;
            continue;
        }

        if (name.includes(key)) {
            score += 4;
        }

        if (!key.includes(" ") && hasWholeWord(words, key)) {
            score += 6;
        }
    }

    return score;
}

function countPhraseHits(name: string, phrases?: string[]) {
    if (!phrases?.length) return 0;

    let score = 0;

    for (const phrase of phrases) {
        const value = normalize(phrase);
        if (!value) continue;

        if (name === value) {
            score += 20;
            continue;
        }

        if (name.includes(value)) {
            score += 14;
        }
    }

    return score;
}

function countPlaidHits(primary: string, plaid?: string[]) {
    if (!plaid?.length || !primary) return 0;
    return plaid.includes(primary) ? 16 : 0;
}

function getNodeScore(name: string, words: string[], primary: string, node: any, depth: number) {
    const keywordScore = countKeywordHits(name, words, node?.keywords);
    const phraseScore = countPhraseHits(name, node?.phrases);
    const plaidScore = countPlaidHits(primary, node?.plaid);
    const hitScore = keywordScore + phraseScore + plaidScore;

    if (hitScore <= 0) return 0;

    const depthBonus = depth * 3;
    return hitScore + depthBonus;
}

function isLeafNode(node: any) {
    return !node?.children || Object.keys(node.children).length === 0;
}

function findBestPath(
    name: string,
    words: string[],
    primary: string,
    node: any,
    path: string[] = [],
    depth = 0
): MatchResult | null {
    let best: MatchResult | null = null;

    const ownScore = getNodeScore(name, words, primary, node, depth);

    if (ownScore > 0 && isLeafNode(node)) {
        best = {
            path,
            score: ownScore,
            reason: `leaf match: ${path.join(".")}`,
        };
    }

    if (node?.children) {
        for (const [key, child] of Object.entries(node.children)) {
            const result = findBestPath(
                name,
                words,
                primary,
                child,
                [...path, key],
                depth + 1
            );

            if (!result) continue;

            if (!best || result.score > best.score) {
                best = result;
                continue;
            }

            if (best && result.score === best.score && result.path.length > best.path.length) {
                best = result;
            }
        }
    }

    if (!best && ownScore > 0 && path.length > 0) {
        best = {
            path,
            score: ownScore,
            reason: `branch match: ${path.join(".")}`,
        };
    }

    return best;
}

function hasPhrase(name: string, phrases: string[]) {
    return phrases.some((phrase) => {
        const value = normalize(phrase);
        return value && name.includes(value);
    });
}

function classifyDirection(tx: any, name: string): Direction {
    const type = normalize(tx?.type || "");
    const primary = normalize(tx?.personal_finance_category?.primary || "");

    if (type === "income") return "income";
    if (primary === "income") return "income";

    const incomeSignals = [
        "direct deposit",
        "salary deposit",
        "payroll deposit",
        "bonus payout",
        "paycheck deposit",
        "employer deposit",
        "payroll",
        "salary",
        "wages",
        "paycheck",
        "commission",
    ];

    if (hasPhrase(name, incomeSignals)) {
        return "income";
    }

    return "expense";
}

function resolveIncomePath(name: string, words: string[], primary: string): MatchResult | null {
    const incomeNode = CATEGORY_RULES.income;
    const score = getNodeScore(name, words, primary, incomeNode, 0);

    if (score <= 0) return null;

    return {
        path: ["income"],
        score,
        reason: "income rule matched",
    };
}

function resolveSpentPath(name: string, words: string[], primary: string): MatchResult | null {
    return findBestPath(
        name,
        words,
        primary,
        CATEGORY_RULES.spent,
        ["spent"],
        0
    );
}

export function categorizeTransaction(tx: any): CategorizedResult {
    const name = normalize(tx?.name || tx?.description || "");
    const words = splitWords(name);
    const primary = normalize(tx?.personal_finance_category?.primary || "");
    const direction = classifyDirection(tx, name);

    const strongDebtPhrases = [
        "credit card payment",
        "loan payment",
        "card payment",
        "debt payment",
        "installment payment",
    ];

    const strongSavingsPhrases = [
        "transfer to savings",
        "savings transfer",
        "automatic savings",
    ];

    if (direction === "income") {
        const incomeMatch = resolveIncomePath(name, words, primary);

        if (incomeMatch) {
            return {
                direction: "income",
                path: incomeMatch.path,
                confidence: incomeMatch.score,
                reason: incomeMatch.reason,
            };
        }

        return {
            direction: "income",
            path: ["income"],
            confidence: 10,
            reason: "income type fallback",
        };
    }

    if (hasPhrase(name, strongDebtPhrases)) {
        return {
            direction: "expense",
            path: ["spent", "debt"],
            confidence: 100,
            reason: "strong debt phrase matched",
        };
    }

    if (hasPhrase(name, strongSavingsPhrases)) {
        return {
            direction: "expense",
            path: ["spent", "savings"],
            confidence: 100,
            reason: "strong savings phrase matched",
        };
    }

    const spentMatch = resolveSpentPath(name, words, primary);

    if (spentMatch) {
        return {
            direction: "expense",
            path: spentMatch.path,
            confidence: spentMatch.score,
            reason: spentMatch.reason,
        };
    }

    return {
        direction: "expense",
        path: ["spent", "expenses", "other"],
        confidence: 0,
        reason: "expense fallback",
    };
}