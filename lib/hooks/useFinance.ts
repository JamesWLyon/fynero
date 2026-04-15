"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
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
                setLoading(false);
                return;
            }

            setTransactions(data || []);
            setLoading(false);
        }

        load();
    }, []);

    const aggregatedAll = useMemo(() => {
        return aggregateTransactions(transactions);
    }, [transactions]);

    const get = useCallback((path: string, time?: TimeFilter) => {
        if (!time || time === "all") {
            return getValue(aggregatedAll, path);
        }

        const filtered = filterByTime(transactions, time);
        const aggregated = aggregateTransactions(filtered);

        return getValue(aggregated, path);
    }, [transactions, aggregatedAll]);

    return {
        transactions,
        loading,
        aggregatedAll,
        get,
    };
}