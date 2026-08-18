import { NextResponse } from "next/server";
import sharp from "sharp";

import { validateImageUpload } from "@/lib/server/image-upload";
import { sealPhoto } from "@/lib/server/secure-photo";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };

    return entities[char] ?? char;
  });
}

function createWatermarkSvg(width: number, height: number) {
  const label = escapeXml("USVISAPHOTO PREVIEW");
  const footer = escapeXml("USVISAPHOTO PROTECTED PREVIEW");

  const marks: string[] = [];

  const stepX = Math.max(180, Math.round(width * 0.38));
  const stepY = Math.max(80, Math.round(height * 0.13));

  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      marks.push(`
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="17"
          font-weight="500"
          fill="#173c91"
          fill-opacity="0.13"
          transform="rotate(-24 ${x} ${y})"
        >${label}</text>
      `);
    }
  }

  return Buffer.from(
    `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${marks.join("")}

      <rect
        x="8"
        y="8"
        width="${Math.max(0, width - 16)}"
        height="${Math.max(0, height - 16)}"
        rx="10"
        fill="none"
        stroke="#60a5fa"
        stroke-opacity="0.55"
        stroke-width="2"
        stroke-dasharray="8 7"
      />

      <rect
        x="14"
        y="${Math.max(0, height - 48)}"
        width="${Math.max(0, width - 28)}"
        height="34"
        fill="#111827"
        fill-opacity="0.58"
      />

      <text
        x="28"
        y="${Math.max(17, height - 25)}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="17"
        font-weight="600"
        fill="#ffffff"
      >${footer}</text>
    </svg>
    `,
    "utf8"
  );
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(
    req,
    "secure-photo",
    24,
    10 * 60_000
  );

  if (limited) {
    return limited;
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: "Use multipart form data for image uploads.",
        },
        {
          status: 415,
        }
      );
    }

    const formData = await req.formData();

    const validation = validateImageUpload(
      formData.get("image")
    );

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        {
          status: validation.status,
        }
      );
    }

    const buffer = Buffer.from(
      await validation.file.arrayBuffer()
    );

   let metadata;

try {
  metadata = await sharp(buffer).metadata();
} catch {
      return NextResponse.json(
        {
          error: "The uploaded image could not be decoded.",
        },
        {
          status: 415,
        }
      );
    }

    const width = metadata.width;
    const height = metadata.height;

    if (!width || !height) {
      return NextResponse.json(
        {
          error: "Unable to determine image dimensions.",
        },
        {
          status: 415,
        }
      );
    }

    const watermark = createWatermarkSvg(width, height);

    const preview = await sharp(buffer)
      .rotate()
      .composite([
        {
          input: watermark,
          blend: "over",
        },
      ])
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();

    console.log("SECURE_PHOTO_QA", {
      inputWidth: width,
      inputHeight: height,
      inputFormat: metadata.format ?? "unknown",
      previewFormat: "png",
      inputBytes: buffer.length,
      previewBytes: preview.length,
    });

    return NextResponse.json(
      {
        token: sealPhoto(buffer),

        preview: `data:image/png;base64,${preview.toString(
          "base64"
        )}`,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("SECURE PHOTO ERROR:", error);

    return NextResponse.json(
      {
        error: "Photo protection failed.",
      },
      {
        status: 500,
      }
    );
  }
}