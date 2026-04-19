"use client";

import { useMemo, useState } from "react";

import { Title, SubTitle } from "@/app/ui/Titles";
import Wrapper from "@/app/ui/Wrapper";
import ShowTransactions from "@/app/ui/transaction-data/TransactionsTable";
import TransactionToolbar from "@/app/ui/transaction-data/TransactionToolbar";

import { useFinance } from "@/lib/hooks/useFinance";
import {
    filterTransactions,
    getDefaultTransactionToolbarFilters,
    type TransactionToolbarFilters,
} from "@/lib/finance/transactionFilters";

export default function Transactions() {
    const { transactions, get, loading } = useFinance();

    const transactionData = useMemo(() => {
        const spent = get("spent", "month");

        return {
            spent,
        };
    }, [get]);

    const [filters, setFilters] = useState<TransactionToolbarFilters>(
        getDefaultTransactionToolbarFilters()
    );

    const filteredTransactions = useMemo(() => {
        return filterTransactions(transactions, filters);
    }, [transactions, filters]);

    if (loading) {
        return (
            <>
                <Title title="Transactions" />
                <SubTitle>
                    <span>Filter through your past spending!</span>
                </SubTitle>
                <p>Loading...</p>
            </>
        );
    }

    return (
        <>
            <Title title="Transactions" />

            <SubTitle className="mb-6">
                <span>Filter through your past spending!</span>
            </SubTitle>

            <Wrapper className="w-full max-w-full overflow-x-hidden flex flex-col justify-center items-center">
                <div className="w-full lg:w-[90%] max-w-full flex flex-col gap-4 overflow-x-hidden">
                    <TransactionToolbar
                        transactions={transactions}
                        filters={filters}
                        onChange={setFilters}
                        exportTransactions={filteredTransactions}
                        exportCsvFilename="fynero-transactions.csv"
                        exportPdfFilename="fynero-transactions.pdf"
                        exportPdfTitle="Fynero Transactions Export"
                    />

                    <ShowTransactions
                        transactions={filteredTransactions}
                        limit={10}
                        pages
                        showDate
                        showCategory
                        showAccount
                        showAmount
                        showIcon
                    />
                </div>
            </Wrapper>
        </>
    );
}