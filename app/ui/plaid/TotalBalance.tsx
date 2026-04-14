"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface Account {
    account_id: string;
    name: string;
    official_name: string | null;
    type: string;
    subtype: string | null;
    balances: {
        current: number | null;
        available: number | null;
        iso_currency_code: string | null;
    };
}

interface TotalBalanceProps {
    breakdown?: boolean;
}

export default function TotalBalance({ breakdown = false }: TotalBalanceProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/plaid/get-balance");
                if (!res.ok) throw new Error("Failed to fetch balance");
                const data = await res.json();
                setAccounts(data.accounts || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (!breakdown) return;
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [breakdown]);

    function handleMouseEnter() {
        if (!breakdown || !ref.current) return;
        // getBoundingClientRect is already relative to the viewport
        // so for fixed positioning we don't add scrollY/scrollX
        const rect = ref.current.getBoundingClientRect();
        setPopupPos({
            top: rect.bottom + 8,
            left: rect.left,
        });
        setVisible(true);
    }

    if (loading) return <span>Loading...</span>;

    const total = accounts.reduce(
        (sum, acc) => sum + (acc.balances.current ?? 0),
        0
    );

    const formatted = (n: number) =>
        n.toLocaleString("en-US", { style: "currency", currency: "USD" });

    const popup = visible && (
        <div
            className="fixed min-w-[220px] rounded-xl border border-white/10 bg-[#1a2236] p-4 shadow-xl text-sm flex flex-col gap-3"
            style={{
                top: popupPos.top,
                left: popupPos.left,
                zIndex: 999999,
            }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {accounts.length === 1 ? (
                <div className="flex justify-between gap-6">
                    <span className="text-white/60">
                        {accounts[0].official_name || accounts[0].name}
                    </span>
                    <span className="text-white font-medium">
                        {formatted(accounts[0].balances.current ?? 0)}
                    </span>
                </div>
            ) : (
                <>
                    {accounts.map((acc) => (
                        <div key={acc.account_id} className="flex justify-between gap-6">
                            <span className="text-white/60 capitalize">
                                {acc.official_name || acc.name}
                                {acc.subtype && (
                                    <span className="ml-1 text-white/30 text-xs">
                                        ({acc.subtype})
                                    </span>
                                )}
                            </span>
                            <span className="text-white font-medium">
                                {formatted(acc.balances.current ?? 0)}
                            </span>
                        </div>
                    ))}
                    <div className="flex justify-between gap-6 border-t border-white/10 pt-3 mt-1">
                        <span className="text-white/60">Total</span>
                        <span className="text-white font-semibold">
                            {formatted(total)}
                        </span>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <>
            <span
                ref={ref}
                className="inline-block cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setVisible(false)}
            >
                {formatted(total)}
            </span>

            {/* portal renders directly into document.body, 
                escaping ALL parent stacking contexts */}
            {typeof window !== "undefined" && createPortal(popup, document.body)}
        </>
    );
}