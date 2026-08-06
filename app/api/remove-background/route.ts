import { NextResponse } from "next/server";
import { fetchWithTimeout, validateImageUpload } from "@/lib/server/image-upload";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "remove-background", 12, 10 * 60_000);
  if (limited) return limited;
  try {
    const apiKey = process.env.PHOTOROOM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "PHOTOROOM_API_KEY is missing" },
        { status: 500 }
      );
    }

    const incomingForm = await req.formData();
    const validation = validateImageUpload(incomingForm.get("image"));
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status });
    const image = validation.file;

    const photoRoomForm = new FormData();
    photoRoomForm.append("image_file", image, image.name || "photo.jpg");
    photoRoomForm.append("format", "png");

    const photoRoomRes = await fetchWithTimeout("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: photoRoomForm,
    }, 90_000);

    if (!photoRoomRes.ok) {
      const errorText = await photoRoomRes.text();
      console.error("PhotoRoom API error:", photoRoomRes.status, errorText);

      return NextResponse.json(
        {
          error: "PhotoRoom API error",
          status: photoRoomRes.status,
          requestId: photoRoomRes.headers.get("x-request-id") || undefined,
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
