"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // 🥇 Step 1: Get link token from your backend
  useEffect(() => {
    async function fetchLinkToken() {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const data = await res.json();
      setLinkToken(data.link_token);
    }

    fetchLinkToken();
  }, []);

  // 🥈 Step 2: Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
  const res = await fetch("/api/plaid/exchange-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_token }),
  });

  const data = await res.json();
  console.log("Saved:", data);
}
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Connect Bank
    </button>
  );
}