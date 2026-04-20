import {
    House, 
    DollarSign, 
    PiggyBank, 
    ScrollText, 
    Settings, 
    Headset, 
    UserRound, 
    ChartNoAxesColumn, 
    ArrowRightLeft 
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";

type NavItem = {
    name?: string;
    label: string;
    icon?: LucideIcon;
    children?: NavItem[];
};

export const navItems: NavItem[] = [
    {
        label: 'MENU',
        children: [
            {
                name: 'dashboard',
                label: 'Dashboard',
                icon: House,
            },
            {
                name: 'spending',
                label: 'Spending',
                icon: DollarSign,
            },
            {
                name: 'transactions',
                label: 'Transactions',
                icon: ArrowRightLeft,
            },
            {
                name: 'bills',
                label: 'Bills',
                icon: ScrollText,
            },
            {
                name: 'budget',
                label: 'Budget',
                icon: ChartNoAxesColumn,
            }, 
        ],
    },
    {
        label: 'GENERAL',
        children: [
                {
                name: 'settings',
                label: 'Settings',
                icon: Settings,
            },
            {
                name: 'account',
                label: 'Account',
                icon: UserRound,
            },
            {
                name: 'help-center',
                label: 'Help Center',
                icon: Headset,
            },
        ],
    },
];