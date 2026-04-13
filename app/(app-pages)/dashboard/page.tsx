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

export default function Dashboard() {
    const { get, loading, transactions } = useFinance();

    useEffect(() => {
    if (transactions.length === 0) return;
        const debug = aggregateTransactions(filterByTime(transactions, "month"));
        console.log("📊 full aggregated tree:", JSON.stringify(debug, null, 2));
    }, [transactions]);

    const barChartData = useMemo(() => [
        { 
            label: "Expenses",   
            value: get("expenses", "month")
        },
        { 
            label: "Bills", 
            value: get("expenses.food", "month")
        },
    ], [transactions]);

    return (
        <>
            <AutoSync />
            <Title title="Dashboard" />
            <SubTitle title="Welcome back, User!" />
            <Wrapper className="grid grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg" />
                    <p className="text-[2rem]"><TotalBalance /></p>
                    <p className="flex items-center"><Icon name="chevronUp" className="mr-2" />$500 from last week</p>
                </Card>
                <Card>
                    <CardTitle title="Monthly Spending" className="text-lg" />
                    <p className="text-[2rem]">${get("income", "month")}</p>
                    <p className="flex items-center"><Icon name="chevronDown" className="mr-2" />$200 from last week</p>
                </Card>
                <Card>
                    <CardTitle title="Budget Left" className="text-lg" />
                    <p className="text-[2rem]">${(get("income", "month") - get("spending", "month")).toFixed(2)}</p>
                    <p>32% left of your monthly budget of $1,656.25</p>
                </Card>
                <Card>
                    <CardTitle title="Upcoming Bills" className="text-lg" />
                    <p className="text-[2rem]">${get("bills", "month")}</p>
                    <ul>
                        <li>Electricity - $120.00 - Due in 5 days</li>
                        <li>Internet - $50.00 - Due in 10 days</li>
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
                            <SimplePieChart data={barChartData} />
                        </div>
                        <ul className="grid gap-4 ml-6 text-lg">
                            <li><span className="inline-block w-4 h-4 bg-[#0088FE] mr-2"></span>Bills</li>
                            <li><span className="inline-block w-4 h-4 bg-[#00C49F] mr-2"></span>Savings</li>
                            <li><span className="inline-block w-4 h-4 bg-[#FFBB28] mr-2"></span>Debt</li>
                            <li><span className="inline-block w-4 h-4 bg-[#FF8042] mr-2"></span>Expenses</li>
                        </ul>
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