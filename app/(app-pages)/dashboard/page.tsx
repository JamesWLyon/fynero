"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Card from "@/app/ui/Card";
import DeltaBadge from "@/app/ui/DeltaBadge";
import BudgetBadge from "@/app/ui/BudgetBadge";
import MonthYearDropdown from "@/app/ui/MonthYearDropdown";
import { Title, SubTitle, CardTitle } from "@/app/ui/Titles";
import UsernameDisplay from "@/app/ui/UsernameDisplay";
import Wrapper from "@/app/ui/Wrapper";
import SimpleBarChart from "@/app/ui/charts/SimpleBarChart";
import SimplePieChart from "@/app/ui/charts/SimplePieChart";
import AutoSync from "@/app/ui/plaid/AutoSync";
import TotalBalance from "@/app/ui/plaid/TotalBalance";
import ShowTransactions from "@/app/ui/transaction-data/TransactionsTable";

import { useFinance } from "@/lib/hooks/useFinance";

export default function Dashboard() {
    const { transactions, get, loading } = useFinance();

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const transactionData = useMemo(() => {
        const income = get("income", "month");
        const spent = get("spent", "month");
        const prevSpent = get("spent", "month:previous");
        const bills = get("spent.expenses.bills", "month");

        return {
            income,
            spent,
            prevSpent,
            bills,
            budgetLeft: income - spent,
        };
    }, [get]);

    const barChartData = useMemo(() => [
        {
            label: "Income",
            value: get("income", selectedDate),
        },
        {
            label: "Budget",
            value: 100,
        },
        {
            label: "Spent",
            value: get("spent", selectedDate),
        },
    ], [get, selectedDate]);

    const pieChartData = useMemo(() => {
        const keys = [
            "spent.savings",
            "spent.debt",
            "spent.expenses",
        ];

        return keys.map((key) => ({
            label: key.split(".").pop()!,
            value: get(key, selectedDate),
        }));
    }, [get, selectedDate]);

    if (loading) {
        return (
            <>
                <AutoSync />
                <Title title="Dashboard" />
                <SubTitle>
                    <span>
                        Welcome back, <UsernameDisplay />
                    </span>
                </SubTitle>
                <p>Loading...</p>
            </>
        );
    }

    return (
        <>
            <AutoSync />
            <Title title="Dashboard" />

            <SubTitle>
                <span>
                    Welcome back, <UsernameDisplay />
                </span>
            </SubTitle>

            <Wrapper className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">
                        <TotalBalance breakdown />
                    </p>
                    <p className="text-secondary/80">
                        Click to view more
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Current Month Spending" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${transactionData.spent}</p>
                    <p className="flex items-center">
                        <DeltaBadge
                            value={transactionData.spent - transactionData.prevSpent}
                            suffix=" last month"
                        />
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Budget Left of Current Month" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${transactionData.budgetLeft.toFixed(2)}</p>
                    <p>
                        <BudgetBadge
                            spending={transactionData.spent}
                            income={transactionData.income}
                            suffix=" of income spent"
                        />
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Upcoming Bills" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${transactionData.bills}</p>
                    <ul>
                        <li>Electricity - $120.00 - Due in 5 days</li>
                    </ul>
                </Card>
            </Wrapper>

            <Wrapper className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <Card>
                    <Wrapper className="
                        flex flex-col items-center mb-7
                        justify-center gap-3 sm:flex-row 
                        sm:gap-0 sm:items-center text-center
                    ">
                        <CardTitle title="Income vs Expenses" className="text-[2rem]" />
                        <MonthYearDropdown
                            linked
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="sm:ml-auto"
                        />
                    </Wrapper>

                    <div className="w-full max-w-[720px] h-[25rem]">
                        <SimpleBarChart data={barChartData} />
                    </div>
                </Card>

                <Card>
                    <Wrapper className="
                        flex flex-col items-center 
                        justify-center gap-3 sm:flex-row 
                        sm:gap-0 sm:items-center text-center
                    ">
                        <CardTitle title="Spent Breakdown" className="text-[2rem]" />
                        <MonthYearDropdown
                            linked
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="sm:ml-auto"
                        />
                    </Wrapper>

                    <Wrapper className="flex items-center justify-center">
                        <div className="w-full max-w-[720px] h-[25rem]">
                            <SimplePieChart data={pieChartData} />
                        </div>
                    </Wrapper>
                </Card>

                <Card>
                    <CardTitle title="Recent Transactions" className="text-[2rem] text-center sm:text-left mb-4" />
                    <ShowTransactions
                        transactions={transactions}
                        limit={4}
                        showCategory
                        showAmount
                        showIcon
                    />

                    <div className="mt-4 flex justify-end">
                        <Link
                            href="/transactions"
                            className="
                                inline-flex items-center rounded-xl border border-white/10
                                bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition
                                hover:bg-white/[0.05] hover:text-white
                            "
                        >
                            View All
                        </Link>
                    </div>
                </Card>

                <Card>
                    <CardTitle title="Budget Overview" className="text-[2rem]" />
                </Card>
            </Wrapper>
        </>
    );
}