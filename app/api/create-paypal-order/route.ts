import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "http://localhost:3000";
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: "US Visa Photo Download",
          amount: {
            currency_code: "USD",
            value: "4.99",
          },
        },
      ],
      application_context: {
        brand_name: "USVisaPhoto",
        user_action: "PAY_NOW",
        return_url: `${origin}/api/capture-paypal-order`,
        cancel_url: `${origin}/?canceled=1`,
      },
    }),
  });

  const data = await res.json();
  const approveUrl = data.links?.find((link: any) => link.rel === "approve")?.href;

  return NextResponse.json({ url: approveUrl });
}