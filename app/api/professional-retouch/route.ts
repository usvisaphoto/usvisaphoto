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

- Treat this image as the source for a universal E.R.U portrait master from which multiple passport and visa photo sizes will later be generated.
- The final edited image MUST contain enough real-looking upper-body content for later 2x2, 3.5x4.5, 3x4, 4x6, and 5x7 crops without exposing blank white canvas below the subject.
- Extend and reconstruct the portrait downward when necessary. The reconstructed result must include both complete shoulders and a substantial upper-torso clothing area below the shoulders.
- Do not leave blank, empty, or artificially white canvas underneath the clothing or shoulders.
- Any newly available lower canvas area must be filled naturally with reconstructed clothing, upper torso, and background as appropriate.
- Reconstruct missing left and right clothing and shoulder areas using the visible neckline, collar, garment structure, pattern, seams, folds, texture, lighting, body anatomy, and existing clothing as references.
- Continue striped, patterned, textured, or structured garments naturally into reconstructed areas. Pattern scale and direction must remain visually consistent with the original garment.
- Preserve the original clothing type, collar, neckline, design, material, pattern, color, texture, and fit unless a separate destination clothing-color rule explicitly requires recoloring.

PORTRAIT CENTERING AND POSTURE:

- Create a naturally centered professional ID-photo composition.
- The head, neck, and upper torso should appear visually centered as one portrait rather than centering only the face.
- Correct obvious lateral upper-body displacement when necessary.
- Both shoulders must have convincing and sufficient visible width for later portrait cropping.
- If one shoulder is excessively raised, lowered, pushed forward, rotated, shortened, cropped, or visually dominant, gently correct the shoulder and local upper-torso posture.
- Make the shoulders appear naturally balanced, as if the photographer corrected the subject's posture before taking the photograph.
- Do not create perfect mirror symmetry.
- Do not make the shoulders mathematically horizontal.
- Preserve subtle natural human asymmetry.

IDENTITY AND ANATOMY PROTECTION:

- Preserve the person's exact facial identity.
- Preserve the original face shape, facial proportions, eyes, nose, mouth, jaw, ears, forehead, hairline, hairstyle, expression, and apparent age.
- Preserve the original head size relative to the source portrait.
- Preserve natural neck width, body type, and realistic anatomy.
- Do not narrow, widen, lengthen, shorten, reshape, or beautify the face or body.
- Do not shrink the face merely to create additional space.
- Do not stretch the person vertically or horizontally.
- Do not simply zoom the original photograph out and leave unused canvas.
- Do not move only the face independently of the neck and torso.

MASTER OUTPUT REQUIREMENT:

- The result must look like one continuous photograph captured with a camera, not an original photograph placed over an extended canvas.
- There must be no visible boundary between original and reconstructed areas.
- There must be no blank white strip beneath the subject.
- There must be no abrupt clothing cutoff at the bottom edge.
- The reconstructed lower clothing and background must remain photorealistic and continuous.
- Generate enough upper-torso content so subsequent portrait crops can safely remove excess lower content instead of needing to add missing content.
- Prioritize a complete, centered, naturally balanced upper-body master over matching the tight crop of the uploaded source.
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
