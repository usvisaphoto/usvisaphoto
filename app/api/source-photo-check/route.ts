import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- Original phone photo
- Original camera photo
- Original portrait

PRINTED_PHOTO
- Printed passport photo
- Printed ID photo
- Printed studio portrait

PHOTO_OF_PHOTO
- Someone photographed a printed photograph.

SCREEN_CAPTURE
- Phone screen
- Monitor
- Tablet
- Screenshot

UNCERTAIN
- Cannot determine confidently.
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

    const parsed = JSON.parse(response.output_text);

    return NextResponse.json(normalize(parsed));
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        source: "UNCERTAIN",
      },
      { status: 200 }
    );
  }
}