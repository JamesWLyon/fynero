type BuiltInNode = {
    children?: Record<string, BuiltInNode>;
    [key: string]: unknown;
};

export type CategoryTreeNode = {
    key: string;
    label: string;
    path: string;
    parentPath: string | null;
    isCustom?: boolean;
    children: CategoryTreeNode[];
};

export type UserCategoryRow = {
    id: string;
    label: string;
    parent_path: string;
    full_path: string;
};

function titleCase(value: string) {
    return value
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getLastSegment(path: string) {
    const parts = path.split(".").filter(Boolean);
    return parts[parts.length - 1] ?? path;
}

function sortNodes(nodes: CategoryTreeNode[]) {
    return [...nodes].sort((a, b) => a.label.localeCompare(b.label));
}

function buildBuiltInTreeFromRules(
    rules: Record<string, BuiltInNode>,
    parentPath: string | null = null
): CategoryTreeNode[] {
    return sortNodes(
        Object.entries(rules).map(([key, value]) => {
            const path = parentPath ? `${parentPath}.${key}` : key;
            const children = value?.children
                ? buildBuiltInTreeFromRules(value.children, path)
                : [];

            return {
                key,
                label: titleCase(key),
                path,
                parentPath,
                children,
            };
        })
    );
}

function cloneTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes.map((node) => ({
        ...node,
        children: cloneTree(node.children),
    }));
}

function findNode(nodes: CategoryTreeNode[], path: string): CategoryTreeNode | null {
    for (const node of nodes) {
        if (node.path === path) return node;
        const found = findNode(node.children, path);
        if (found) return found;
    }
    return null;
}

function ensureParentNode(
    tree: CategoryTreeNode[],
    parentPath: string
): CategoryTreeNode | null {
    return findNode(tree, parentPath);
}

function insertCustomNode(
    tree: CategoryTreeNode[],
    category: UserCategoryRow
) {
    const parent = ensureParentNode(tree, category.parent_path);
    if (!parent) return;

    const existing = parent.children.find((child) => child.path === category.full_path);
    if (existing) return;

    parent.children.push({
        key: getLastSegment(category.full_path),
        label: category.label,
        path: category.full_path,
        parentPath: category.parent_path,
        isCustom: true,
        children: [],
    });

    parent.children = sortNodes(parent.children);
}

export function buildMergedCategoryTree(
    categoryRules: Record<string, BuiltInNode>,
    userCategories: UserCategoryRow[] = []
): CategoryTreeNode[] {
    const baseTree = cloneTree(buildBuiltInTreeFromRules(categoryRules));

    for (const category of userCategories) {
        if (!category.parent_path || !category.full_path) continue;
        insertCustomNode(baseTree, category);
    }

    return baseTree;
}

export function getNodeByPath(
    tree: CategoryTreeNode[],
    path: string
): CategoryTreeNode | null {
    return findNode(tree, path);
}

export function getChildrenOfPath(
    tree: CategoryTreeNode[],
    path: string
): CategoryTreeNode[] {
    const node = getNodeByPath(tree, path);
    return node ? node.children : [];
}

export function getSelectablePaths(
    tree: CategoryTreeNode[],
    includeRoot = true
): string[] {
    const results: string[] = [];

    function walk(nodes: CategoryTreeNode[]) {
        for (const node of nodes) {
            if (includeRoot || node.parentPath !== null) {
                results.push(node.path);
            }
            if (node.children.length > 0) {
                walk(node.children);
            }
        }
    }

    walk(tree);
    return results;
}

export function getDisplayLabelFromPath(path: string) {
    return titleCase(getLastSegment(path));
}

export function mapPathToLegacyFields(path: string) {
    const parts = path.split(".").filter(Boolean);

    if (!parts.length) {
        return {
            type: "expense",
            category: "other",
            sub_category: null as string | null,
        };
    }

    if (parts[0] === "income") {
        return {
            type: "income",
            category: "income",
            sub_category: parts[1] ?? null,
        };
    }

    if (parts[0] !== "spent") {
        return {
            type: "expense",
            category: "other",
            sub_category: null,
        };
    }

    if (parts[1] === "debt") {
        return {
            type: "expense",
            category: "debt",
            sub_category: parts[2] ?? null,
        };
    }

    if (parts[1] === "savings") {
        return {
            type: "expense",
            category: "savings",
            sub_category: parts[2] ?? null,
        };
    }

    if (parts[1] === "expenses") {
        return {
            type: "expense",
            category: parts[2] ?? "other",
            sub_category: parts[3] ?? null,
        };
    }

    return {
        type: "expense",
        category: "other",
        sub_category: null,
    };
}

export function normalizeCategoryLabel(label: string) {
    return label.trim().toLowerCase().replace(/\s+/g, "_");
}