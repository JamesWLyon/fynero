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
import { getChildKeys } from "@/lib/finance/categories";

export default function Dashboard() {
    const { get, loading } = useFinance();

    const [barDate, setBarDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [pieDate, setPieDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    // get month data once
    const monthData = useMemo(() => {
        const income = get("income", "month");
        const spent = get("spent", "month");
        const prevSpent = get("spent", "month:previous");
        const bills = get("bills", "month");

        return {
            income,
            spent,
            prevSpent,
            bills,
            budgetLeft: income - spent,
        };
    }, [get]);

    // bar chart data
    const barChartData = useMemo(() => [
        { label: "Income", value: get("income", barDate) },
        { label: "Budget", value: 100 },
        { label: "Spent", value: get("spent", barDate) },
    ], [get, barDate.month, barDate.year]);

    // pie chart data
    const pieChartData = useMemo(() => {
        const keys = getChildKeys("spent");

        return keys.map((key) => ({
            label: key.split(".").pop()!,
            value: get(key, pieDate),
        }));
    }, [get, pieDate.month, pieDate.year]);

    return (
        <>
            <AutoSync />
            <Title title="Dashboard" />

            <SubTitle>
                <span>
                    Welcome back, <UsernameDisplay />
                </span>
            </SubTitle>

            {/* TOP CARDS */}
            <Wrapper className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">
                        <TotalBalance breakdown />
                    </p>
                </Card>

                <Card>
                    <CardTitle title="Monthly spent" className="text-lg text-secondary/80" />
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

            {/* CHARTS */}
            <Wrapper className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Income vs Expenses" className="text-[2rem]" />
                        <MonthYearDropdown onChange={setBarDate} className="ml-auto" />
                    </Wrapper>

                    <div style={{ width: "100%", height: "300px" }}>
                        <SimpleBarChart data={barChartData} />
                    </div>
                </Card>

                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Spent Breakdown" className="text-[2rem]" />
                        <MonthYearDropdown onChange={setPieDate} className="ml-auto" />
                    </Wrapper>

                    <Wrapper className="flex items-center justify-center">
                        <div style={{ width: "300px", height: "300px" }}>
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