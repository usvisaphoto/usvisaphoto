import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export async function POST() {
  try {
    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "usd",

              product_data: {
                name: "U.S. Visa & Passport Photo",
              },

              unit_amount: 499,
            },

            quantity: 1,
          },
        ],

        success_url:
          "http://localhost:3000/success",

        cancel_url:
          "http://localhost:3000",
      });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Stripe Error",
      },
      {
        status: 500,
      }
    );
  }
}