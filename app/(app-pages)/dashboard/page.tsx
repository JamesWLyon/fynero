"use client";

import { useMemo } from "react";
import Card from "@/app/ui/Card";
import { Title, SubTitle, CardTitle } from "@/app/ui/Titles";
import Wrapper from "@/app/ui/Wrapper";
import SimpleBarChart from "@/app/ui/charts/SimpleBarChart";
import SimplePieChart from "@/app/ui/charts/SimplePieChart";
import Icon from "@/app/ui/Icon";
import MonthYearDropdown from "@/app/ui/MonthYearDropdown";
import AutoSync from "@/app/ui/plaid/AutoSync";
import TotalBalance from "@/app/ui/plaid/TotalBalance";
import { useFinance } from "@/lib/hooks/useFinance";
import { aggregateTransactions } from "@/lib/finance/aggregate";
import { filterByTime } from "@/lib/finance/filterTime";
import { useEffect } from "react";
import DeltaBadge from "@/app/ui/DeltaBadge";
import BudgetBadge from "@/app/ui/BudgetBadge";

export default function Dashboard() {
    const { get, loading, transactions } = useFinance();

    useEffect(() => {
    if (transactions.length === 0) return;
        const debug = aggregateTransactions(filterByTime(transactions, "month"));
        console.log("📊 full aggregated tree:", JSON.stringify(debug, null, 2));
    }, [transactions]);

    const barChartData = useMemo(() => [
        { 
            label: "Income",   
            value: get("income", "month")
        },
        { 
            label: "Spent", 
            value: get("spending", "month")
        },
    ], [transactions]);

    const pieChartData = useMemo(() => [
        { 
            label: "Bills", 
            value: get("bills", "month")
        },
        { 
            label: "Food",   
            value: get("expenses.food", "month")
        },
        { 
            label: "Shopping",   
            value: get("expenses.shopping", "month")
        },
    ], [transactions]);

    return (
        <>
            <AutoSync />
            <Title title="Dashboard" />
            <SubTitle title="Welcome back, User!" />
            <Wrapper className="grid grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]"><TotalBalance /></p>
                    <p className="flex items-center">
                        <DeltaBadge 
                        value={get("income", "month") - get("income", "month:previous")} 
                        suffix=" last month"/>
                    </p>
                </Card>
                <Card>
                    <CardTitle title="Monthly Spending" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${get("spending", "month")}</p>
                    <p className="flex items-center">
                        <DeltaBadge 
                        value={get("spending", "month") - get("spending", "month:previous")} 
                        suffix=" last month" />
                    </p>
                </Card>
                <Card>
                    <CardTitle title="Budget Left" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${(get("income", "month") - get("spending", "month")).toFixed(2)}</p>
                    <p>
                        <BudgetBadge
                            spending={get("spending", "month")}
                            income={get("income", "month")}
                            suffix=" of income spent"
                        />
                    </p>
                </Card>
                <Card>
                    <CardTitle title="Upcoming Bills" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">${get("bills", "month")}</p>
                    <ul>
                        <li>Electricity - $120.00 - Due in 5 days</li>
                    </ul>
                </Card>
            </Wrapper>
            <Wrapper className="grid grid-cols-2 gap-8 mt-6">
                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Income vs Expenses" className="text-[2rem]" />
                        <MonthYearDropdown className="ml-auto" />
                    </Wrapper>
                    {/* Fixed size wrapper so ResponsiveContainer has something to measure */}
                    <div style={{ width: "100%", height: "300px" }}>
                        <SimpleBarChart data={barChartData} />
                    </div>
                </Card>
                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Spending Breakdown" className="text-[2rem]" />
                        <MonthYearDropdown className="ml-auto" />
                    </Wrapper>
                    <Wrapper className="flex items-center justify-center">
                        {/* Fixed size wrapper so ResponsiveContainer has something to measure */}
                        <div style={{ width: "300px", height: "300px" }}>
                            <SimplePieChart data={pieChartData} />
                        </div>
                    </Wrapper>
                </Card>
                <Card>
                    <CardTitle title="Recent Transactions" className="text-[2rem]" />
                </Card>
                <Card>
                    <CardTitle title="Budget Overview" className="text-[2rem]" />
                </Card>
            </Wrapper>
        </>
    );
}