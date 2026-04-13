import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const client = new PlaidApi(
    new Configuration({
        basePath: PlaidEnvironments.sandbox,
            baseOptions: {
                headers: {
                    "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
                    "PLAID-SECRET": process.env.PLAID_SECRET!,
                },
            },
    })
);

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No user" }, { status: 401 });
        }

        // Get access_token
        const { data: items } = await supabase
            .from("plaid_items")
            .select("*")
            .eq("user_id", user.id)
            .limit(1);

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No bank connected" }, { status: 400 });
        }

        const item = items[0];

        // Get balances
        const response = await client.accountsBalanceGet({
            access_token: item.access_token,
        });

        const accounts = response.data.accounts;

        return NextResponse.json({
            accounts,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Balance fetch failed" }, { status: 500 });
    }
}