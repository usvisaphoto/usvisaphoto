import { NextResponse } from "next/server";
import { getDownloadManifest, unsealPhoto } from "@/lib/server/secure-photo";

export const runtime = "nodejs";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com";
const PRODUCT_PRICES: Record<string, string> = {
  basic: "4.99",
  "basic-international": "7.99",
  professional: "9.99",
  "professional-international": "12.99",
};

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials are unavailable.");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data?.access_token) throw new Error("PayPal authentication failed.");
  return data.access_token as string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const product = typeof body?.product === "string" ? body.product : "";
    const tokens = Array.isArray(body?.tokens)
      ? body.tokens.filter((token: unknown) => typeof token === "string" && token.startsWith("v1.")).slice(0, 2)
      : [];
    const expectedCount = product.endsWith("-international") ? 2 : 1;

    if (!orderId || !PRODUCT_PRICES[product] || tokens.length !== expectedCount) {
      return NextResponse.json({ error: "Invalid download request." }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    const order = await orderResponse.json();
    const unit = order?.purchase_units?.[0];
    const expectedCustomId = `${product}|${getDownloadManifest(tokens)}`;

    if (
      !orderResponse.ok ||
      order?.status !== "COMPLETED" ||
      unit?.custom_id !== expectedCustomId ||
      unit?.amount?.currency_code !== "USD" ||
      unit?.amount?.value !== PRODUCT_PRICES[product]
    ) {
      return NextResponse.json({ error: "Payment could not be verified for these photo files." }, { status: 403 });
    }

    const files = tokens.map((token: string) => {
      const photo = unsealPhoto(token);
      return `data:image/jpeg;base64,${photo.toString("base64")}`;
    });

    return NextResponse.json({ files }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("SECURE DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Secure download failed." }, { status: 500 });
  }
}
