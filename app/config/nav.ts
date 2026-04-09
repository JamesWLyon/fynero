import { House, DollarSign, PiggyBank, ScrollText, Settings, Headset, ArrowRightLeft } from 'lucide-react';
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
                name: 'budget',
                label: 'Budget',
                icon: PiggyBank,
            }, 
            {
                name: 'bills',
                label: 'Bills',
                icon: ScrollText,
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
                name: 'help-center',
                label: 'Help Center',
                icon: Headset,
            },
        ],
    },
];