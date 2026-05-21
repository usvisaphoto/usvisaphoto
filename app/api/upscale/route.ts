import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base64 = body.image_base64;

    if (!base64) {
      return NextResponse.json(
        { error: "이미지가 없습니다" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64, "base64");

    const meta = await sharp(buffer).metadata();

    const W = meta.width || 1000;
    const H = meta.height || 1000;

    const TARGET = 3840;

    const scale = Math.min(TARGET / W, TARGET / H, 4);

    const newW = Math.round(W * scale);
    const newH = Math.round(H * scale);

    const flatBuf = await sharp(buffer)
      .flatten({
        background: {
          r: 255,
          g: 255,
          b: 255,
        },
      })
      .png()
      .toBuffer();

    const result = await sharp(flatBuf)
      .resize(newW, newH, {
        kernel: sharp.kernel.lanczos3,
        fastShrinkOnLoad: false,
      })
      .sharpen({
        sigma: 0.5,
        m1: 0,
        m2: 3,
        x1: 2,
        y2: 10,
        y3: 20,
      })
      .jpeg({
        quality: 97,
        mozjpeg: true,
      })
      .toBuffer();

    return NextResponse.json({
      image_base64: result.toString("base64"),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}