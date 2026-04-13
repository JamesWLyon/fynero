"use client";

import { useEffect } from "react";

export default function AutoSync() {
    useEffect(() => {
        async function sync() {
            await fetch("/api/plaid/sync-transactions", {
                method: "POST",
            });
        }

        sync();
    }, []);

    return null;
}