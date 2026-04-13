import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { createClient } from "@/lib/supabase/server";

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

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();

    // 🥇 Exchange public_token → access_token
    const response = await client.itemPublicTokenExchange({
      public_token,
    });

    const access_token = response.data.access_token;
    const item_id = response.data.item_id;

    // 🥈 Get logged-in user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }

    // 🥉 Save to DB
    const { error } = await supabase.from("plaid_items").insert({
      user_id: user.id,
      access_token,
      item_id,
    });

    if (error) {
      console.error("INSERT ERROR:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Exchange failed" }, { status: 500 });
  }
}