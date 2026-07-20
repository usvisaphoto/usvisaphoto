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

const VALID_PRODUCTS = new Set<ProductType>([
  "basic",
  "basic-international",
  "professional",
  "professional-international",
  "expert",
  "expert-international",
]);

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal environment variables are missing.");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await readJsonSafe(res);

  if (!res.ok || !data?.access_token) {
    console.error("PAYPAL ACCESS TOKEN ERROR:", {
      status: res.status,
      data,
    });

    throw new Error("Unable to authenticate with PayPal.");
  }

  return data.access_token as string;
}

function getProduct(
  paypalData: any,
  requestedProduct: string | null
): ProductType {
  const capturedProduct =
    paypalData?.purchase_units?.[0]?.custom_id ||
    requestedProduct ||
    "basic";

  return VALID_PRODUCTS.has(capturedProduct as ProductType)
    ? (capturedProduct as ProductType)
    : "basic";
}

function getSuccessUrl(
  origin: string,
  product: ProductType,
  orderId: string
) {
  const encodedOrderId = encodeURIComponent(orderId);

  if (
    product === "expert" ||
    product === "expert-international"
  ) {
    return `${origin}/expert-order?paid=1&product=${product}&orderId=${encodedOrderId}`;
  }

  return `${origin}/?paid=1&product=${product}&orderId=${encodedOrderId}`;
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    requestUrl.origin ||
    "https://usvisaphoto.app";

  try {
    const orderId = requestUrl.searchParams.get("token");
    const requestedProduct =
      requestUrl.searchParams.get("product");

    if (!orderId) {
      return NextResponse.redirect(
        `${origin}/?payment_error=missing_order`
      );
    }

    const accessToken = await getAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
        orderId
      )}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    let data = await readJsonSafe(captureRes);

    /*
     * 결제 완료 후 사용자가 새로고침하면
     * PayPal이 이미 캡처된 주문이라고 응답할 수 있다.
     * 이 경우 주문 상태를 다시 조회한다.
     */
    if (!captureRes.ok) {
      const issue =
        data?.details?.[0]?.issue ||
        data?.name ||
        "";

      if (
        issue === "ORDER_ALREADY_CAPTURED" ||
        issue === "UNPROCESSABLE_ENTITY"
      ) {
        const orderRes = await fetch(
          `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
            orderId
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const orderData = await readJsonSafe(orderRes);

        if (orderRes.ok && orderData?.status === "COMPLETED") {
          data = orderData;
        } else {
          console.error("PAYPAL ORDER VERIFY ERROR:", {
            orderId,
            captureStatus: captureRes.status,
            captureData: data,
            verifyStatus: orderRes.status,
            verifyData: orderData,
          });

          return NextResponse.redirect(
            `${origin}/?payment_error=capture`
          );
        }
      } else {
        console.error("PAYPAL CAPTURE ERROR:", {
          orderId,
          status: captureRes.status,
          data,
        });

        return NextResponse.redirect(
          `${origin}/?payment_error=capture`
        );
      }
    }

    if (data?.status !== "COMPLETED") {
      console.error("PAYPAL PAYMENT NOT COMPLETED:", {
        orderId,
        status: data?.status,
        data,
      });

      return NextResponse.redirect(
        `${origin}/?payment_error=not_completed`
      );
    }

    const product = getProduct(data, requestedProduct);

    return NextResponse.redirect(
      getSuccessUrl(origin, product, orderId)
    );
  } catch (error) {
    console.error("CAPTURE PAYPAL ORDER ERROR:", error);

    return NextResponse.redirect(
      `${origin}/?payment_error=unexpected`
    );
  }
}