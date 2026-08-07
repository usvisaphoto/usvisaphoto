import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { PROFESSIONAL_RETOUCH_PROMPT } from "@/lib/prompts/professionalRetouch";
import { fetchWithTimeout, validateImageUpload } from "@/lib/server/image-upload";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type ImageEditResultPayload = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  output?: Array<{
    result?: string;
    image_base64?: string;
    content?: Array<{
      image_base64?: string;
    }>;
  }>;
};

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "professional-retouch", 4, 10 * 60_000);
  if (limited) return limited;
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await req.formData();
    const eyebrowClearanceRequired = formData.get("eyebrowClearanceRequired") === "true";
    const removeEyewearRequired = formData.get("removeEyewearRequired") === "true";
    const countryCode = String(formData.get("countryCode") || "").toUpperCase();
    const darkClothingRequired = 
     countryCode === "KR" ||
     countryCode === "JP" ||
     countryCode === "CN";
    const validation = validateImageUpload(formData.get("image"));
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status });
    const image = validation.file;

    const buffer = Buffer.from(
      await image.arrayBuffer()
    );

    const openaiFile = await toFile(
      buffer,
      "professional-retouch-source.png",
      {
        type: image.type || "image/png",
      }
    );

    const response = await openai.images.edit({
      model: "gpt-image-2",
      image: openaiFile,
      prompt: PROFESSIONAL_RETOUCH_PROMPT + (removeEyewearRequired ? `

DESTINATION EYEWEAR POLICY — REMOVE

- Detect and remove all eyewear when present, including lenses, rims, bridge, nose pads, temples, shadows, glare, and reflections.
- Reconstruct only the small areas physically hidden by the eyewear while preserving exact identity and eye and eyebrow geometry.
- The finished image must contain no glasses or eyewear fragments.
` : `

DESTINATION EYEWEAR POLICY — PRESERVE

- If the source photograph contains glasses, preserve those exact glasses completely.
- Do not remove, replace, redesign, resize, recolor, straighten, relocate, or regenerate the lenses, rims, bridge, nose pads, or temples.
- Preserve natural reflections and transparency unless a tiny lighting cleanup is required; never make the glasses disappear.
- If the source has no glasses, do not add any.
`) + (eyebrowClearanceRequired ? `

KOREAN-STYLE EYEBROW CLEARANCE — REQUIRED

- Both eyebrows must remain completely visible and must not overlap with bangs, fringe, stray hair, shadows, or reconstructed pixels.
- Preserve each eyebrow's exact original outline, arch, length, thickness, spacing, height, hair direction, texture, color, and natural left-right asymmetry.
- Do not redraw, lift, lower, darken, thicken, thin, extend, shorten, or beautify either eyebrow.
- Preserve the exact original eyes, eyelids, forehead, hairline, head shape, and facial identity.
- When hair overlaps an eyebrow, move or clean only the minimum individual overlapping hair strands away from the eyebrow boundary.
- Keep the original hairstyle and overall fringe shape. Do not expose more forehead than necessary.
- Do not erase real eyebrow hairs. Do not merge eyebrow hair with scalp hair.
- The result must look naturally photographed, never cosmetically edited.

` : "") + (darkClothingRequired ? `

DESTINATION CLOTHING COLOR POLICY — KR / JP / CN

- Inspect the subject's clothing color.
- If the clothing is white, near-white, ivory, cream, or very pale and visually blends into the white background, change ONLY the clothing color to a natural dark charcoal gray.
- Target clothing color should be approximately #3F434A.
- Preserve the exact original clothing design, neckline, collar, seams, buttons, folds, fabric texture, fit, highlights, and shadows.
- Do not replace or redesign the clothing.
- Do not turn casual clothing into a suit or different garment.
- Do not modify the face, neck, hair, skin, jewelry, body shape, or background while changing clothing color.
- Preserve realistic fabric lighting and dimensionality.
- Do not make the clothing flat, painted, synthetic, or pure black.
- If the clothing is already medium or dark colored, preserve the original clothing color.

` : ""),
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
    });


    const resultPayload =
      response as unknown as ImageEditResultPayload;

    const imageResult =
      resultPayload?.data?.[0]?.b64_json ??
      resultPayload?.data?.[0]?.url ??
      resultPayload?.output?.[0]?.result ??
      resultPayload?.output?.[0]?.image_base64 ??
      resultPayload?.output?.[0]?.content?.[0]?.image_base64;

    if (
      typeof imageResult !== "string" ||
      imageResult.length === 0
    ) {
      console.error(
        "Professional retouch returned no image:",
        resultPayload
      );

      return NextResponse.json(
        {
          error:
            "Professional retouch failed. No image was returned.",
        },
        {
          status: 500,
        }
      );
    }

    let professionalPreview: string;

    if (imageResult.startsWith("data:image/")) {
      professionalPreview = imageResult;
    } else if (
      imageResult.startsWith("https://") ||
      imageResult.startsWith("http://")
    ) {
      const imageResponse = await fetchWithTimeout(imageResult, {}, 30_000);

      if (!imageResponse.ok) {
        throw new Error(
          "The generated professional photo could not be downloaded."
        );
      }

      const generatedBuffer = Buffer.from(
        await imageResponse.arrayBuffer()
      );

      professionalPreview =
        `data:image/png;base64,${generatedBuffer.toString("base64")}`;
    } else {
      professionalPreview =
        `data:image/png;base64,${imageResult}`;
    }

    return NextResponse.json({
      ok: true,
      professionalPreview,
    });
  } catch (error) {
    console.error(
      "PROFESSIONAL RETOUCH API ERROR:"
    );

    console.dir(error, {
      depth: null,
    });

    return NextResponse.json(
      {
        error: "Professional retouch is temporarily unavailable. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
