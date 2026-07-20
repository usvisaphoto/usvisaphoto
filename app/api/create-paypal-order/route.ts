import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL || "https://api-m.paypal.com";

type ProductType =
  | "basic"
  | "basic-international"
  | "professional"
  | "professional-international"
  | "expert"
  | "expert-international";

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  );

 let data;

try {
  data = await res.json();
} catch (error) {
  console.error("INVALID PAYPAL ACCESS TOKEN RESPONSE:", error);
  throw new Error("Invalid response from PayPal.");
}

  if (!res.ok || !data.access_token) {
    console.error(
      "PAYPAL ACCESS TOKEN ERROR:",
      data
    );

    throw new Error(
      "Unable to authenticate with PayPal."
    );
  }

  return data.access_token as string;
}

export async function POST(req: Request) {
  try {
    const origin =
  req.headers.get("origin") ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://usvisaphoto.app";

    let product: ProductType = "basic";

    try {
      const body = await req.json();

      if (body?.product === "expert-international") {
  product = "expert-international";
} else if (body?.product === "expert") {
  product = "expert";
} else if (body?.product === "professional-international") {
  product = "professional-international";
} else if (body?.product === "professional") {
  product = "professional";
} else if (body?.product === "basic-international") {
  product = "basic-international";
} else {
  product = "basic";
}
    } catch {
      product = "basic";
    }

    const productConfig = {
  basic: {
    description: "U.S. Visa Photo Download",
    value: "4.99",
  },
  "basic-international": {
    description: "U.S. Visa and International Visa Photo Download",
    value: "7.99",
  },
  professional: {
    description: "Professional Retouched U.S. Visa Photo",
    value: "9.99",
  },
  "professional-international": {
    description:
      "Professional Retouched U.S. Visa and International Visa Photos",
    value: "12.99",
  },
  expert: {
    description: "Expert Manual U.S. Visa Photo Editing",
    value: "19.99",
  },
  "expert-international": {
    description:
      "Expert Manual U.S. Visa and International Visa Photo Editing",
    value: "22.99",
  },
}[product];
    const accessToken = await getAccessToken();

    const res = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description:
                productConfig.description,
              custom_id: product,
              amount: {
                currency_code: "USD",
                value:
                  productConfig.value,
              },
            },
          ],
          application_context: {
            brand_name: "USVisaPhoto",
            user_action: "PAY_NOW",
            return_url:
              `${origin}/api/capture-paypal-order?product=${product}`,
            cancel_url:
              `${origin}/?canceled=1`,
          },
        }),
        cache: "no-store",
      }
    );

    let data;

try {
  data = await res.json();
} catch (error) {
  console.error("INVALID PAYPAL CREATE ORDER RESPONSE:", error);

  return NextResponse.json(
    {
      error: "Invalid response from PayPal.",
    },
    {
      status: 502,
    }
  );
}

    if (!res.ok) {
      console.error(
        "PAYPAL CREATE ORDER ERROR:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.message ||
            "PayPal order creation failed.",
        },
        {
          status: res.status,
        }
      );
    }

    const approveUrl =
      data.links?.find(
        (link: {
          rel?: string;
          href?: string;
        }) => link.rel === "approve"
      )?.href;

    if (!approveUrl) {
      console.error(
        "PAYPAL APPROVAL URL MISSING:",
        data
      );

      return NextResponse.json(
        {
          error:
            "PayPal approval URL was not returned.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      url: approveUrl,
      product,
      amount: productConfig.value,
    });
  } catch (error) {
    console.error(
      "CREATE PAYPAL ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create PayPal order.",
      },
      {
        status: 500,
      }
    );
  }
}