import { NextResponse } from "next/server";
import sharp from "sharp";
import { validateImageUpload } from "@/lib/server/image-upload";
import { sealPhoto } from "@/lib/server/secure-photo";

export const runtime = "nodejs";

function watermarkSvg(width: number, height: number) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));

  const labels: string[] = [];

  for (let y = -safeHeight; y < safeHeight * 2; y += 92) {
    for (let x = -safeWidth; x < safeWidth * 2; x += 250) {
      labels.push(
        `<text
          x="${x}"
          y="${y}"
          fill="#173c91"
          fill-opacity="0.13"
          font-family="sans-serif"
          font-size="22"
          font-weight="700"
          transform="rotate(-24 ${x} ${y})"
        >USVISAPHOTO PREVIEW</text>`
      );
    }
  }

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${safeWidth}"
      height="${safeHeight}"
      viewBox="0 0 ${safeWidth} ${safeHeight}"
    >
      ${labels.join("")}

      <rect
        x="8"
        y="8"
        width="${Math.max(1, safeWidth - 16)}"
        height="${Math.max(1, safeHeight - 16)}"
        rx="10"
        fill="none"
        stroke="#60a5fa"
        stroke-opacity="0.55"
        stroke-width="2"
        stroke-dasharray="8 7"
      />

      <rect
        x="14"
        y="${Math.max(0, safeHeight - 48)}"
        width="${Math.max(1, safeWidth - 28)}"
        height="34"
        fill="#111827"
        fill-opacity="0.58"
      />

      <text
        x="28"
        y="${Math.max(16, safeHeight - 25)}"
        fill="#ffffff"
        font-family="sans-serif"
        font-size="16"
      >USVisaPhoto Protected Preview</text>
    </svg>
  `;

  return Buffer.from(svg, "utf8");
}

export async function POST(req: Request) {
  try {
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

    /*
     * 입력 이미지 자체가 Sharp에서 정상적으로 읽히는지
     * 먼저 확인한다.
     */
    const metadata = await sharp(buffer).metadata();

    const width =
      metadata.width && metadata.width > 0
        ? metadata.width
        : 600;

    const height =
      metadata.height && metadata.height > 0
        ? metadata.height
        : 600;

    /*
     * SVG 워터마크를 PNG로 한 번 변환한 뒤
     * 원본 이미지 위에 composite 한다.
     *
     * Sharp가 SVG Buffer를 직접 composite하면서
     * unsupported image format 오류를 내는 환경을 방지한다.
     */
    const watermarkBuffer = await sharp(
      watermarkSvg(width, height),
      {
        density: 144,
      }
    )
      .png()
      .toBuffer();

    const preview = await sharp(buffer)
      .composite([
        {
          input: watermarkBuffer,
          blend: "over",
        },
      ])
      .jpeg({
        quality: 86,
        chromaSubsampling: "4:4:4",
      })
      .toBuffer();

    return NextResponse.json(
      {
        token: sealPhoto(buffer),
        preview: `data:image/jpeg;base64,${preview.toString(
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
    console.error(
      "SECURE PHOTO ERROR:",
      error
    );

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