"use client";

import { useMemo, useState } from "react";

import { Title, SubTitle, CardTitle } from "@/app/ui/Titles";
import Wrapper from "@/app/ui/Wrapper";
import ShowTransactions from "@/app/ui/transaction-data/TransactionsTable";
import TransactionToolbar from "@/app/ui/transaction-data/TransactionToolbar";
import Card from "@/app/ui/Card";
import SimplePieChart from "@/app/ui/charts/SimplePieChart";
import MonthYearDropdown from "@/app/ui/MonthYearDropdown";
import SimpleBarChart from "@/app/ui/charts/SimpleBarChart";

import { useFinance } from "@/lib/hooks/useFinance";
import {
    filterTransactions,
    getDefaultTransactionToolbarFilters,
    type TransactionToolbarFilters,
} from "@/lib/finance/transactionFilters";

export default function Transactions() {
    const sharedStyle = "gap-6";

    const { transactions, get, loading } = useFinance();

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const transactionData = useMemo(() => {
        const spent = get("spent", "month");

        return {
            spent,
        };
    }, [get]);

    const barData = useMemo(() => [
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

    const chartData = useMemo(() => {
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

    const [filters, setFilters] = useState<TransactionToolbarFilters>(
        getDefaultTransactionToolbarFilters()
    );

    const filteredTransactions = useMemo(() => {
        const filtered = filterTransactions(transactions, filters);

        return [...filtered].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return filters.newestFirst ? dateB - dateA : dateA - dateB;
        });
    }, [transactions, filters]);

    if (loading) {
        return (
            <>
                <Title title="Spending" />
                <SubTitle>
                    <span>You spent a total of ${transactionData.spent}</span>
                </SubTitle>
                <p>Loading...</p>
            </>
        );
    }

    return (
        <>
            <Title title="Spending" />
            <SubTitle className="mb-8">
                <span>You spent a total of ${transactionData.spent}</span>
            </SubTitle>

            <Wrapper className={`flex flex-col ${sharedStyle}`}>
                <div className={`flex flex-col xl:flex-row ${sharedStyle}`}>
                    <div className={`flex flex-col w-full xl:w-1/2 ${sharedStyle}`}>
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${sharedStyle}`}>
                            <Card className="w-full">
                                <CardTitle title="Total Spent" className="text-lg text-secondary/80" />
                                <p className="text-[2rem]">
                                    $1000
                                </p>
                            </Card>

                            <Card className="w-full">
                                <CardTitle title="Budget Left" className="text-lg text-secondary/80" />
                                <p className="text-[2rem]">
                                    $123
                                </p>
                            </Card>
                        </div>

                        <Card className="w-full">
                            <Wrapper className="flex mb-8">
                                <CardTitle title="Spending Breakdown" className="text-[1.5rem]" />
                                <MonthYearDropdown
                                    linked
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    className="ml-auto"
                                />
                            </Wrapper>

                            <Wrapper className="flex items-center justify-center">
                                <div className="w-full max-w-[85%] h-[22rem]">
                                    <SimplePieChart data={chartData} />
                                </div>
                            </Wrapper>
                        </Card>
                    </div>

                    <Card className="w-full flex-1 shrink-0">
                        <Wrapper className="flex mb-12">
                            <div>
                                <CardTitle title="Avg. Daily Spending" className="text-[1.5rem]" />
                                <p className="text-[2rem]">
                                    $123
                                </p>
                            </div>

                            <MonthYearDropdown
                                linked
                                value={selectedDate}
                                onChange={setSelectedDate}
                                className="ml-auto"
                            />
                        </Wrapper>

                        <Wrapper className="flex items-center justify-center">
                            <div className="w-full max-w-[80%] h-[25rem]">
                                <SimpleBarChart data={barData} />
                            </div>
                        </Wrapper>
                    </Card>
                </div>

                <Card className="w-full">
                    <TransactionToolbar
                        transactions={transactions}
                        exportTransactions={filteredTransactions}
                        filters={filters}
                        onChange={setFilters}
                    />
                    <ShowTransactions transactions={filteredTransactions} />
                </Card>
            </Wrapper>
        </>
    );
}