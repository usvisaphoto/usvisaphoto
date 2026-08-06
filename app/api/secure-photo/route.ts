import { NextResponse } from "next/server";
import sharp from "sharp";
import { validateImageUpload } from "@/lib/server/image-upload";
import { sealPhoto } from "@/lib/server/secure-photo";

export const runtime = "nodejs";

function watermarkSvg(width: number, height: number) {
  const labels: string[] = [];
  for (let y = -height; y < height * 2; y += 92) {
    for (let x = -width; x < width * 2; x += 250) {
      labels.push(`<text x="${x}" y="${y}" fill="#173c91" fill-opacity=".13" font-family="Arial,sans-serif" font-size="22" font-weight="700" transform="rotate(-24 ${x} ${y})">USVISAPHOTO PREVIEW</text>`);
    }
  }
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${labels.join("")}<rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="10" fill="none" stroke="#60a5fa" stroke-opacity=".55" stroke-width="2" stroke-dasharray="8 7"/><rect x="14" y="${height - 48}" width="${width - 28}" height="34" fill="#111827" fill-opacity=".58"/><text x="28" y="${height - 25}" fill="#fff" font-family="Arial,sans-serif" font-size="16">USVisaPhoto Protected Preview</text></svg>`);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const validation = validateImageUpload(formData.get("image"));
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status });

    const buffer = Buffer.from(await validation.file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 600;
    const height = metadata.height || 600;
    const preview = await sharp(buffer)
      .composite([{ input: watermarkSvg(width, height), blend: "over" }])
      .jpeg({ quality: 86, chromaSubsampling: "4:4:4" })
      .toBuffer();

    return NextResponse.json({
      token: sealPhoto(buffer),
      preview: `data:image/jpeg;base64,${preview.toString("base64")}`,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("SECURE PHOTO ERROR:", error);
    return NextResponse.json({ error: "Photo protection failed." }, { status: 500 });
  }
}
