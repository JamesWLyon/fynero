"use client";

import { useMemo, useState } from "react";

import { Title, SubTitle, CardTitle } from "@/app/ui/Titles";
import Wrapper from "@/app/ui/Wrapper";
import ShowTransactions from "@/app/ui/transaction-data/TransactionsTable";
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

    const {
        transactions,
        get,
        getExpandedChildChartData,
        loading,
    } = useFinance();

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const transactionData = useMemo(() => {
        const spent = get("spent", selectedDate);

        return {
            spent,
        };
    }, [get, selectedDate]);

    const barData = useMemo(
        () => [
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
        ],
        [get, selectedDate]
    );

    const pieChartData = useMemo(() => {
        const data = getExpandedChildChartData("spent", selectedDate);

        console.log("PIE CHART DATA");
        console.log("selectedDate:", selectedDate);
        console.log("data:", data);

        return data;
    }, [getExpandedChildChartData, selectedDate]);

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
                    <div className={`flex w-full flex-col xl:w-1/2 ${sharedStyle}`}>
                        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2`}>
                            <Card className="w-full">
                                <CardTitle title="Total Spent" className="text-lg text-secondary/80" />
                                <p className="text-[2rem]">
                                    ${transactionData.spent}
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
                            <Wrapper
                                className="
                                    flex flex-col items-center
                                    justify-center gap-3 text-center
                                    sm:flex-row sm:items-center sm:gap-0
                                "
                            >
                                <CardTitle title="Spending Breakdown" className="text-[1.5rem]" />
                                <MonthYearDropdown
                                    linked
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    className="sm:ml-auto"
                                />
                            </Wrapper>

                            <Wrapper className="flex items-center justify-center">
                                <div className="h-[25rem] w-full max-w-[720px]">
                                    <SimplePieChart data={pieChartData} />
                                </div>
                            </Wrapper>
                        </Card>
                    </div>

                    <Card className="w-full flex-1 shrink-0">
                        <Wrapper
                            className="
                                mb-12 flex flex-col items-center
                                justify-center gap-3 text-center
                                sm:flex-row sm:items-center sm:gap-0 sm:text-left
                            "
                        >
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
                                className="sm:ml-auto"
                            />
                        </Wrapper>

                        <Wrapper className="flex items-center justify-center">
                            <div className="h-[28rem] w-full max-w-[80%]">
                                <SimpleBarChart data={barData} />
                            </div>
                        </Wrapper>
                    </Card>
                </div>

                <Card className="w-full">
                    <ShowTransactions
                        transactions={filteredTransactions}
                        limit={10}
                        showDate
                        pages
                        showCategory
                        showAccount
                        showAmount
                        showIcon
                    />
                </Card>
            </Wrapper>
        </>
    );
}