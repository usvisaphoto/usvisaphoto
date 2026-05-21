import { NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

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

    // base64 → Buffer
    const buffer = Buffer.from(base64, "base64");

    // Buffer → Blob
    const blob = new Blob([buffer], {
      type: "image/png",
    });

    // AI 배경제거
    const resultBlob = await removeBackground(blob, {
      output: {
        format: "image/png",
        type: "foreground",
      },
    });

    // Blob → ArrayBuffer
    const arrayBuffer = await resultBlob.arrayBuffer();

    // ArrayBuffer → base64
    const resultBase64 = Buffer.from(arrayBuffer).toString(
      "base64"
    );

    // 결과 반환
    return NextResponse.json({
      image_base64: resultBase64,
    });
  } catch (e: any) {
    console.error("배경제거 오류:", e);

    return NextResponse.json(
      {
        error: e.message || "배경제거 실패",
      },
      {
        status: 500,
      }
    );
  }
}