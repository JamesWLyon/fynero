type NavItem = {
    name?: string;
    label: string;
    children?: NavItem[];
};

export const navItems: NavItem[] = [
    {
        label: 'MENU',
        children: [
            {
                name: 'dashboard',
                label: 'Dashboard',
            },
            {
                name: 'spending',
                label: 'Spending',
                children: [
                    {
                        name: 'transactions',
                        label: 'Transactions',
                    },
                ],
            },
            {
                name: 'budget',
                label: 'Budget',
            }, 
            {
                name: 'bills',
                label: 'Bills',
                children: [
                    {
                        name: 'subscriptions',
                        label: 'Subscriptions',
                    },
                    {
                        name: 'recurring-bills',
                        label: 'Recurring Bills',
                    }
                ],
            },
        ],
    },
    {
        label: 'GENERAL',
        children: [
                {
                name: 'settings',
                label: 'Settings',
            },
            {
                name: 'help-center',
                label: 'Help Center',
            },
        ],
    },
];