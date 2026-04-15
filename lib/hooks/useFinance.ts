"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

import { aggregateTransactions } from "@/lib/finance/aggregate";
import { filterByTime } from "@/lib/finance/filterTime";
import { getValue } from "@/lib/finance/getValue";
import { TimeFilter } from "@/lib/finance/TimeFilter";

export function useFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("transactions")
                .select("*");

            if (error) {
                console.error(error);
                return;
            }

            setTransactions(data || []);
            setLoading(false);
        }

        load();
    }, []);

    // aggregate once for all-time
    const aggregatedAll = useMemo(() => {
        return aggregateTransactions(transactions);
    }, [transactions]);

    // getter function
    const get = (path: string, time?: TimeFilter) => {
        if (!time || time === "all") {
            return getValue(aggregatedAll, path);
        }

        const filtered = filterByTime(transactions, time);
        const aggregated = aggregateTransactions(filtered);

        return getValue(aggregated, path);
    };

    return {
        transactions,
        loading,
        aggregatedAll,
        get,
    };
}