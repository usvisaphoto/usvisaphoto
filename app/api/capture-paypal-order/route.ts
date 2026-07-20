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
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    console.error("PAYPAL ACCESS TOKEN ERROR:", data);
    throw new Error("Unable to authenticate with PayPal.");
  }

  return data.access_token as string;
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("token");
    const requestedProduct = url.searchParams.get("product");

    if (!orderId) {
      return NextResponse.redirect(`${origin}/?canceled=1`);
    }

    const accessToken = await getAccessToken();

    const res = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("PAYPAL CAPTURE ERROR:", data);

      return NextResponse.redirect(
        `${origin}/?payment_error=capture`
      );
    }

    if (data.status !== "COMPLETED") {
      console.error("PAYPAL PAYMENT NOT COMPLETED:", data);

      return NextResponse.redirect(`${origin}/?canceled=1`);
    }

    const capturedProduct =
  data.purchase_units?.[0]?.custom_id ||
  requestedProduct ||
  "basic";

 if (capturedProduct === "expert-international") {
  return NextResponse.redirect(
    `${origin}/expert-order?paid=1&product=expert-international&orderId=${encodeURIComponent(orderId)}`
  );
}

if (capturedProduct === "expert") {
  return NextResponse.redirect(
    `${origin}/expert-order?paid=1&product=expert&orderId=${encodeURIComponent(orderId)}`
  );
}

if (capturedProduct === "professional-international") {
  return NextResponse.redirect(
    `${origin}/?paid=1&product=professional-international&orderId=${encodeURIComponent(orderId)}`
  );
}

if (capturedProduct === "professional") {
  return NextResponse.redirect(
    `${origin}/?paid=1&product=professional&orderId=${encodeURIComponent(orderId)}`
  );
}

if (capturedProduct === "basic-international") {
  return NextResponse.redirect(
    `${origin}/?paid=1&product=basic-international&orderId=${encodeURIComponent(orderId)}`
  );
}

return NextResponse.redirect(
  `${origin}/?paid=1&product=basic&orderId=${encodeURIComponent(orderId)}`
);
  } catch (error) {
    console.error("CAPTURE PAYPAL ORDER ERROR:", error);

    return NextResponse.redirect(
      `${origin}/?payment_error=unexpected`
    );
  }
}