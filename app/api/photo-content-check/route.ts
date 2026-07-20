import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type InspectionResult = {
  headwear: "HEADWEAR" | "NO_HEADWEAR" | "UNCERTAIN";
  overlay: "OVERLAY_DETECTED" | "NO_OVERLAY" | "UNCERTAIN";
};

function normalizeInspectionResult(value: unknown): InspectionResult {
  if (!value || typeof value !== "object") {
    return {
      headwear: "UNCERTAIN",
      overlay: "UNCERTAIN",
    };
  }

  const result = value as Record<string, unknown>;

  const headwear =
    result.headwear === "HEADWEAR" ||
    result.headwear === "NO_HEADWEAR" ||
    result.headwear === "UNCERTAIN"
      ? result.headwear
      : "UNCERTAIN";

  const overlay =
    result.overlay === "OVERLAY_DETECTED" ||
    result.overlay === "NO_OVERLAY" ||
    result.overlay === "UNCERTAIN"
      ? result.overlay
      : "UNCERTAIN";

  return {
    headwear,
    overlay,
  };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "Photo inspection is temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "No photo was received.",
        },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Inspect this passport or visa photo source image for two separate conditions.

Return JSON only in this exact structure:

{
  "headwear": "HEADWEAR | NO_HEADWEAR | UNCERTAIN",
  "overlay": "OVERLAY_DETECTED | NO_OVERLAY | UNCERTAIN"
}

HEADWEAR RULES

Use "HEADWEAR" when the person is wearing:
- a cap
- baseball cap
- flat cap
- beanie
- hat
- helmet
- non-religious head covering

Do not classify normal hair, bangs, wigs, hair accessories,
or ordinary hairstyles as headwear.

Use "UNCERTAIN" when the top of the head is cropped,
unclear, heavily obscured, or impossible to verify.

OVERLAY RULES

Use "OVERLAY_DETECTED" only when there is clear and unmistakable evidence
that text, a logo, a watermark, or a graphic was digitally placed over
the uploaded portrait image.

Examples that must be classified as "OVERLAY_DETECTED":
- repeated watermark words across the face, hair, clothing, or background
- diagonal preview text placed across the portrait
- a translucent studio or agency watermark covering the person
- copyright text digitally stamped over the image
- a sample, proof, preview, or stock-photo mark placed over the portrait
- a digitally added logo or graphic covering any part of the portrait

Use "NO_OVERLAY" for normal photographs, including photographs containing:
- text or logos naturally printed on clothing
- signs, posters, calendars, notices, or writing physically present in the room
- wallpaper, decorations, furniture, windows, doors, or background objects
- naturally photographed business logos or product labels
- shadows, reflections, lighting patterns, compression artifacts, or image noise
- plain, colored, textured, or photographed backgrounds
- ordinary photo-studio backgrounds
- jewelry, hair accessories, clothing patterns, or makeup

Important decision rule:
Do not classify an image as "OVERLAY_DETECTED" merely because text,
a logo, an object, or a pattern is visible somewhere in the photograph.

The text, logo, watermark, or graphic must clearly appear digitally
superimposed on top of the portrait image.

When there is no clear digitally superimposed watermark or graphic,
return "NO_OVERLAY".

Use "UNCERTAIN" only when the image is too blurred, corrupted, or incomplete
to inspect. Do not use "UNCERTAIN" for an ordinary clear photograph.

For overlay detection, false positives must be avoided.
A normal photograph must default to "NO_OVERLAY" unless a digitally
superimposed watermark, preview mark, or graphic is clearly visible.
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
          name: "photo_inspection",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              headwear: {
                type: "string",
                enum: ["HEADWEAR", "NO_HEADWEAR", "UNCERTAIN"],
              },
              overlay: {
                type: "string",
                enum: [
                  "OVERLAY_DETECTED",
                  "NO_OVERLAY",
                  "UNCERTAIN",
                ],
              },
            },
            required: ["headwear", "overlay"],
          },
        },
      },
    });

    let parsed: unknown;

    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      console.error(
        "PHOTO INSPECTION INVALID JSON:",
        response.output_text
      );

      parsed = null;
    }

    const inspection = normalizeInspectionResult(parsed);

    return NextResponse.json({
      // 기존 logic.ts와의 호환성을 위해 status 유지
      status: inspection.headwear,
      headwearStatus: inspection.headwear,
      overlayStatus: inspection.overlay,
    });
  } catch (error) {
    console.error("PHOTO CONTENT CHECK ERROR:", error);

    return NextResponse.json(
      {
        error: "Photo inspection could not be completed.",
      },
      { status: 500 }
    );
  }
}