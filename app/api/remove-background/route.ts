import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.PHOTOROOM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "PHOTOROOM_API_KEY is missing" },
        { status: 500 }
      );
    }

    const incomingForm = await req.formData();
    const image = incomingForm.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const photoRoomForm = new FormData();
    photoRoomForm.append("image_file", image, image.name || "photo.jpg");
    photoRoomForm.append("format", "png");

    const photoRoomRes = await fetch("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: photoRoomForm,
    });

    if (!photoRoomRes.ok) {
      const errorText = await photoRoomRes.text();
      console.error("PhotoRoom API error:", photoRoomRes.status, errorText);

      return NextResponse.json(
        {
          error: "PhotoRoom API error",
          status: photoRoomRes.status,
          detail: errorText,
        },
        { status: photoRoomRes.status }
      );
    }

    const arrayBuffer = await photoRoomRes.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("remove-background route error:", error);

    return NextResponse.json(
      { error: "Background removal failed" },
      { status: 500 }
    );
  }
}