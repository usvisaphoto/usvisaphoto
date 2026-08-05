import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type SourceResult = {
  source:
    | "DIGITAL"
    | "PRINTED_PHOTO"
    | "PHOTO_OF_PHOTO"
    | "SCREEN_CAPTURE"
    | "UNCERTAIN";
};

function normalize(value: unknown): SourceResult {
  if (!value || typeof value !== "object") {
    return { source: "UNCERTAIN" };
  }

  const result = value as Record<string, unknown>;

  const source =
    result.source === "DIGITAL" ||
    result.source === "PRINTED_PHOTO" ||
    result.source === "PHOTO_OF_PHOTO" ||
    result.source === "SCREEN_CAPTURE" ||
    result.source === "UNCERTAIN"
      ? result.source
      : "UNCERTAIN";

  return { source };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { source: "UNCERTAIN" },
        { status: 200 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "No image." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());

    const dataUrl =
      `data:${image.type || "image/jpeg"};base64,${bytes.toString("base64")}`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Determine whether this uploaded image is suitable for automatic passport/visa photo generation.

Return ONLY JSON.

{
 "source":"DIGITAL | PRINTED_PHOTO | PHOTO_OF_PHOTO | SCREEN_CAPTURE | UNCERTAIN"
}

DIGITAL
- Original phone or camera photo
- Original digital studio portrait
- Clean digital image with no visible paper, frame, device, or screen

PRINTED_PHOTO
- Scan or image of a printed passport, ID, or studio photograph
- Visible photo paper, print border, paper texture, gloss, or print artifacts

PHOTO_OF_PHOTO
- A printed photograph was photographed again
- Visible paper edges, surrounding surface, perspective distortion,
  glare, reflections, or shadows around the printed photograph

SCREEN_CAPTURE
- Photo displayed on or photographed from a phone, tablet, or monitor
- Visible screen edges, pixels, moire, glare, interface, or device frame
- Screenshot of another photo

UNCERTAIN
- Cannot determine confidently

Do not classify a clean original digital portrait as printed or screen-based
without visible evidence. When evidence is ambiguous, return UNCERTAIN.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "source_photo_check",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: {
                type: "string",
                enum: [
                  "DIGITAL",
                  "PRINTED_PHOTO",
                  "PHOTO_OF_PHOTO",
                  "SCREEN_CAPTURE",
                  "UNCERTAIN",
                ],
              },
            },
            required: ["source"],
          },
        },
      },
    });

    let parsed: unknown = null;

    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      console.error(
        "SOURCE PHOTO CHECK INVALID JSON:",
        response.output_text
      );
    }

    return NextResponse.json(normalize(parsed));
  } catch (error) {
    console.error("SOURCE PHOTO CHECK ERROR:", error);

    return NextResponse.json(
      {
        source: "UNCERTAIN",
      },
      { status: 200 }
    );
  }
}
