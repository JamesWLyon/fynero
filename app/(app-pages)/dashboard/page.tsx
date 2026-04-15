"use client";

import { useEffect, useMemo, useState } from "react";
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

import { aggregateTransactions } from "@/lib/finance/aggregate";
import { filterByTime } from "@/lib/finance/filterTime";
import { useFinance } from "@/lib/hooks/useFinance";


export default function Dashboard() {
    {/* Variables and data for the front */}
    const { get, loading, transactions } = useFinance();

    useEffect(() => {
    if (transactions.length === 0) return;
        const debug = aggregateTransactions(filterByTime(transactions, "month"));
        console.log("full aggregated tree:", JSON.stringify(debug, null, 2));
    }, [transactions]);

    const [barDate, setBarDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [pieDate, setPieDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const barChartData = useMemo(() => [
        {
            label: "Budget",
            value: 100,
        },
        { 
            label: "Income", 
            value: get("income", barDate) 
        },
        { 
            label: "Spent",  
            value: get("spending", barDate) 
        },
    ], [get, barDate.month, barDate.year]);

    const pieChartData = useMemo(() => [
        { 
            label: "Bills",    
            value: get("bills", pieDate) 
        },
        { 
            label: "Food",     
            value: get("expenses.food", pieDate) 
        },
        { 
            label: "Shopping", value: 
            get("expenses.shopping", pieDate) 
        },
    ], [get, pieDate.month, pieDate.year]); 
    

    {/* Actual page content */}
    return (
        <>
            <AutoSync />
            <Title title="Dashboard" />
            <SubTitle>
                <span>
                    Welcome back, <UsernameDisplay />
                </span>
            </SubTitle>
            <Wrapper className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg text-secondary/80" />
                    <p className="text-[2rem]">
                        <TotalBalance breakdown />
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
            <Wrapper className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Income vs Expenses" className="text-[2rem]" />
                        <MonthYearDropdown onChange={setBarDate} className="ml-auto" />
                    </Wrapper>
                    {/* Fixed size wrapper so ResponsiveContainer has something to measure */}
                    <div style={{ width: "100%", height: "300px" }}>
                        <SimpleBarChart data={barChartData} />
                    </div>
                </Card>
                <Card>
                    <Wrapper className="flex">
                        <CardTitle title="Spending Breakdown" className="text-[2rem]" />
                        <MonthYearDropdown onChange={setPieDate} className="ml-auto" />
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

                    <Link href="/transactions">
                        View All
                    </Link>
                </Card>
                <Card>
                    <CardTitle title="Budget Overview" className="text-[2rem]" />
                </Card>
            </Wrapper>
        </>
    );
}