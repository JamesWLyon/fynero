"use client";

import { useMemo, useState } from "react";
import { Link } from "lucide-react";

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

import { useFinance } from "@/lib/hooks/useFinance";

export default function Dashboard() {
    const { get, loading } = useFinance();

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const monthData = useMemo(() => {
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
            "spent.expenses.bills",
            "spent.expenses.food",
            "spent.expenses.shopping",
            "spent.expenses.transport",
            "spent.expenses.personal",
            "spent.expenses.other",
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
                </Card>

                <Card>
                    <CardTitle title="Monthly Spending" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${monthData.spent}</p>
                    <p className="flex items-center">
                        <DeltaBadge
                            value={monthData.spent - monthData.prevSpent}
                            suffix=" last month"
                        />
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Budget Left" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${monthData.budgetLeft.toFixed(2)}</p>
                    <p>
                        <BudgetBadge
                            spending={monthData.spent}
                            income={monthData.income}
                            suffix=" of income spent"
                        />
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Upcoming Bills" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${monthData.bills}</p>
                    <ul>
                        <li>Electricity - $120.00 - Due in 5 days</li>
                    </ul>
                </Card>
            </Wrapper>

            <Wrapper className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <Card>
                    <Wrapper className="flex mb-8">
                        <CardTitle title="Income vs Expenses" className="text-[2rem]" />
                        <MonthYearDropdown
                            linked
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="ml-auto"
                        />
                    </Wrapper>

                    <div className="w-full max-w-[720px] h-[25rem]">
                        <SimpleBarChart data={barChartData} />
                    </div>
                </Card>

                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Spent Breakdown" className="text-[2rem]" />
                        <MonthYearDropdown
                            linked
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="ml-auto"
                        />
                    </Wrapper>

                    <Wrapper className="flex items-center justify-center">
                        <div className="w-full max-w-[720px] h-[25rem]">
                            <SimplePieChart data={pieChartData} />
                        </div>
                    </Wrapper>
                </Card>

                <Card>
                    <CardTitle title="Recent Transactions" className="text-[2rem]" />
                    <Link href="/transactions">View All</Link>
                </Card>

                <Card>
                    <CardTitle title="Budget Overview" className="text-[2rem]" />
                </Card>
            </Wrapper>
        </>
    );
}