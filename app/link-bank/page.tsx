"use client";

import Wrapper from "../ui/Wrapper";
import PlaidLinkButton from "@/app/ui/plaid/PlaidLinkButton";

export default function LinkBank() {
    async function syncTransactions() {
    const res = await fetch("/api/plaid/sync-transactions", {
        method: "POST",
    });

    const data = await res.json();
    console.log(data);
    }


    return (
        <Wrapper className="bg-black-500">
            <PlaidLinkButton />
            <button onClick={syncTransactions} className="bg-red-500">
                Sync Transactions
            </button>
        </Wrapper>
    );
}