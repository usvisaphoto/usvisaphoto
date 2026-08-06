import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Checkout is temporarily unavailable." },
        { status: 503 }
      );
    }
    const stripe = new Stripe(stripeSecretKey);
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "US Visa Photo Download",
              description: "Download your embassy-ready US visa photo.",
            },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
