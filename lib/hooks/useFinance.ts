"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getValue } from "@/lib/finance/getValue";

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

    return {
        transactions,
        loading,

        get: (path: string, time?: string) =>
            getValue(transactions, path, time),
    };
}