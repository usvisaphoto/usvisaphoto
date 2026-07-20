import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {

  
  try {
    const formData = await req.formData();

    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Photo is required." },
        { status: 400 }
      );
    }

    // ...

    const paypalOrderId =
      String(formData.get("paypalOrderId") || "");

    const customerName =
      String(formData.get("customerName") || "");

    const deliveryMethod =
      String(formData.get("deliveryMethod") || "");

    const contactValue =
      String(formData.get("contactValue") || "");

    const instructions =
      String(formData.get("instructions") || "");

    const extension =
      file.name.split(".").pop() || "jpg";

    const filename =
      `expert-orders/${Date.now()}-${crypto.randomUUID()}.${extension}`;

   const blob = await put(filename, file, {
  access: "private",
 });
    return NextResponse.json({
      success: true,

      order: {
        paypalOrderId,
        customerName,
        deliveryMethod,
        contactValue,
        instructions,

        imageUrl: blob.url,
      },
    });
  } catch (error) {
  console.error("Expert Order Upload Error");
  console.error(error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : String(error),
    },
    {
      status: 500,
    }
  );
}
}