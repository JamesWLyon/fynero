"use client";

import { useEffect, useState } from "react";
import { getBalance } from "@/lib/api/plaid";

export default function TotalBalance() {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            const data = await getBalance();

            const total = data.accounts.reduce(
                (sum: number, acc: any) =>
                    sum + (acc.balances.current || 0),
                0
            );

            setBalance(total);
        }

        load();
    }, []);

    return <span>${balance ?? "Loading..."}</span>;
}