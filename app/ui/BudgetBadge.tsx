import React from "react";

interface BudgetBadgeProps {
    spending: number;
    income: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

export default function BudgetBadge({ spending, income, prefix, suffix }: BudgetBadgeProps) {
    if (income === 0) return <span className="text-gray-400">No income data</span>;

    const percent = (spending / income) * 100;
    const isOver = percent > 100;

    const color =
        percent > 75 ? "text-green-400"
        : percent > 50 ? "text-orange-400"
        : percent > 25 ? "text-yellow-400"
        : "text-red-400";

    return (
        <span className={`flex items-center gap-1`}>
            {prefix && <span>{prefix}</span>}
            <span>
                <span className={`${color}`}>
                    {isOver ? "-" : ""}{Math.min(percent, 999).toFixed(2)}%
                </span>
                {suffix}
            </span>
        </span>
    );
}