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
    const shoulderRecoveryRequired = formData.get("shoulderRecoveryRequired") === "true";
    const countryCode = String(formData.get("countryCode") || "").toUpperCase();
    console.log("PROFESSIONAL RETOUCH FLAGS:", {
  removeEyewearRequired,
  eyebrowClearanceRequired,
  shoulderRecoveryRequired,
  countryCode,
});
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
console.log("PROFESSIONAL RETOUCH BASE PROMPT LENGTH:", PROFESSIONAL_RETOUCH_PROMPT.length);

    const response = await openai.images.edit({
      model: "gpt-image-2",
      image: openaiFile,
      prompt: PROFESSIONAL_RETOUCH_PROMPT + (removeEyewearRequired ? `

DESTINATION EYEWEAR POLICY — COMPLETE REMOVAL — ABSOLUTE HIGHEST PRIORITY

MANDATORY EDIT:
The subject is wearing eyeglasses in the source image.
The final image MUST NOT contain eyeglasses.

This is a required physical image edit, not a recommendation.
Do not preserve the source eyewear.

REMOVE COMPLETELY:
- both lenses
- all lens edges
- left and right rims
- bridge
- nose pads
- temples and arms
- frame portions beside the eyes
- frame portions near the ears
- glare and reflections caused by the lenses
- shadows caused by the frame
- every visible or partial eyewear fragment

After removing the eyewear, naturally reconstruct ONLY the facial pixels that were physically hidden by it.

IDENTITY PRESERVATION:
- Preserve the person's exact identity.
- Preserve the original eye size, shape, spacing, direction, iris position, eyelids, and expression.
- Preserve the original eyebrows exactly.
- Preserve the nose, cheeks, ears, forehead, face shape, jaw, skin texture, and facial proportions.
- Do not enlarge, beautify, reshape, reposition, or redesign the eyes.
- Do not alter the hairstyle or facial expression.

TASK PRIORITY:
1. Complete removal of all eyewear.
2. Exact preservation of facial identity.
3. Required shoulder or upper-body recovery, if requested.
4. All remaining professional retouch instructions.

IMPORTANT:
Shoulder recovery, lighting correction, skin correction, clothing processing, and all other refinements MUST NOT cause the eyeglasses to be restored or regenerated.

FINAL VISUAL CHECK:
Before returning the image, inspect both eyes, the nose bridge, both temples, and both ears.
There must be ZERO lenses, ZERO rims, ZERO bridge, ZERO temples, ZERO glare, and ZERO eyewear fragments in the final image.
` : `

DESTINATION EYEWEAR POLICY — PRESERVE

- If glasses are present, preserve the original glasses, including their shape, position, color, lenses, rims, bridge, nose pads, and temples.
- Preserve natural transparency and reflections except for minimal lighting cleanup.
- Never remove or redesign the glasses.
- If no glasses are present, do not add any.
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

` : "") + 

(shoulderRecoveryRequired ? `

SHOULDER AND UPPER-BODY RECOVERY — REQUIRED

- The source photo has been specifically classified as recoverable because the shoulder or upper-body composition is insufficient.
- Shoulder and upper-body recovery is REQUIRED for this image. Do not return the image with the original tight or cropped shoulder composition unchanged.
- Extend the visible clothing and shoulder area only as much as necessary to create a natural professional passport/visa portrait.
- Reconstruct missing left and/or right shoulder areas using the visible anatomy, neckline, collar, garment structure, fabric texture, seams, folds, lighting, and opposite shoulder as references.
- If one shoulder is pushed forward, rotated, raised, lowered, or visually dominant, gently correct the local shoulder and upper-torso posture.
- Keep the face, head size, facial identity, neck anatomy, and natural body type unchanged.
- Preserve the original clothing type, design, pattern, color, collar, texture, and fit unless a separate destination clothing-color rule explicitly requires recoloring.
- Do not simply zoom the portrait out without reconstructing the missing shoulder/clothing area.
- Do not shrink the face to create artificial space.
- Do not move the whole person sideways merely to create room.
- Do not mirror the opposite shoulder exactly.
- Do not create perfectly horizontal or mathematically symmetrical shoulders.
- Preserve natural human asymmetry.
- The final image must show a convincingly complete and naturally balanced upper-body composition suitable for an official passport/visa photograph.

`: "") + 

(darkClothingRequired ? `

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
