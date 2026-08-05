import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import {
  PROFESSIONAL_RETOUCH_PROMPT,
  GLASSES_REMOVAL_PROMPT,
} from "@/lib/prompts/professionalRetouch";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const formData = await req.formData();
    const image = formData.get("image");
    const removeGlasses = formData.get("removeGlasses") === "true";

    console.log(
      "PROFESSIONAL REMOVE GLASSES:",
      removeGlasses
    );

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "Image file is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "The uploaded file must be an image.",
        },
        {
          status: 400,
        }
      );
    }

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

    console.log("===== BEFORE OPENAI =====");
    console.time("OPENAI");

    const response = await openai.images.edit({
      model: "gpt-image-2",
      image: openaiFile,
      prompt: removeGlasses
        ? [
            GLASSES_REMOVAL_PROMPT,
            "",
            "The glasses-removal instructions above are mandatory and have the highest priority.",
            "The returned photograph must contain no eyeglasses, lenses, rims, bridge, nose pads, hinges, temples, reflections, shadows, glare, or frame remnants.",
            "The final result must clearly look like the same person naturally photographed without glasses.",
            "",
            PROFESSIONAL_RETOUCH_PROMPT,
          ].join("\n")
        : PROFESSIONAL_RETOUCH_PROMPT,
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
    });

    console.timeEnd("OPENAI");
    console.log("===== AFTER OPENAI =====");

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
      const imageResponse = await fetch(imageResult);

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

    console.log(
      "PROFESSIONAL PREVIEW LENGTH:",
      professionalPreview.length
    );

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
        error:
          error instanceof Error
            ? error.message
            : "Professional retouch failed.",
      },
      {
        status: 500,
      }
    );
  }
}
