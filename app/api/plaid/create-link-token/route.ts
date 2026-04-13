import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { Products } from "plaid";
import { CountryCode } from "plaid";

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
        const response = await client.linkTokenCreate({
            user: {
                client_user_id: "test-user-id", // we'll replace this later
            },
            client_name: "Fynero",
            products: [Products.Transactions],
            country_codes: [
                CountryCode.Us, 
                CountryCode.Ca
            ],
            language: "en",
        });

        return NextResponse.json(response.data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
    }
}