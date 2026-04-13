import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { createClient } from "@/lib/supabase/server";
import { categorizeTransaction } from "@/lib/finance/categorize";

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

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }

    // Get user's plaid item
    const { data: items } = await supabase
      .from("plaid_items")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No bank connected" }, { status: 400 });
    }

    const item = items[0];

    // Sync transactions
    const response = await client.transactionsSync({
      access_token: item.access_token,
      cursor: item.cursor || undefined,
    });

    const { added, next_cursor } = response.data;

    // Insert transactions into DB
    if (added.length > 0) {
      const formatted = added.map((tx) => {
      const cat = categorizeTransaction(tx);

      return {
        user_id: user.id,
        plaid_transaction_id: tx.transaction_id,
        amount: tx.amount,
        description: tx.name,
        category: cat.category,
        sub_category: cat.sub,
        type: cat.main, // Main bucket (income, expenses, etc.)
      };
    });

      await supabase.from("transactions").insert(formatted);
    }

    // Save new cursor
    await supabase
      .from("plaid_items")
      .update({ cursor: next_cursor })
      .eq("id", item.id);

    return NextResponse.json({
      success: true,
      added: added.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}