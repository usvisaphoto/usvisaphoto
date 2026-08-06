import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { validateImageUpload } from '@/lib/server/image-upload';

export const runtime = 'nodejs';

const PHOTO_FORMATS = {
  us: { width: 600, height: 600, filename: 'us_passport_photo_2x2.jpg' },
  kr: { width: 413, height: 531, filename: 'korea_passport_photo_35x45mm.jpg' },
  jp: { width: 413, height: 531, filename: 'japan_passport_photo_35x45mm.jpg' },
  cn: { width: 390, height: 567, filename: 'china_passport_photo_33x48mm.jpg' },
  ca: { width: 591, height: 827, filename: 'canada_passport_photo_50x70mm.jpg' },
  in: { width: 413, height: 531, filename: 'india_passport_photo_35x45mm.jpg' },
  vn: { width: 472, height: 709, filename: 'vietnam_passport_photo_40x60mm.jpg' },
  other: { width: 413, height: 531, filename: 'international_passport_photo_35x45mm.jpg' },
  tr: { width: 591, height: 709, filename: 'turkiye_passport_photo_50x60mm.jpg' },
  my: { width: 413, height: 591, filename: 'malaysia_passport_photo_35x50mm.jpg' },
  hk: { width: 472, height: 591, filename: 'hong_kong_passport_photo_40x50mm.jpg' },
  fi: { width: 500, height: 653, filename: 'finland_passport_photo_500x653.jpg' },
  ar: { width: 472, height: 472, filename: 'argentina_consular_photo_40x40mm.jpg' },
  international: { width: 413, height: 531, filename: 'international_visa_photo_35x45mm.jpg' },
} as const;

type PhotoFormat = keyof typeof PHOTO_FORMATS;

function getPhotoFormat(
  value: FormDataEntryValue | null
): PhotoFormat {
  const normalized = String(value ?? 'us').toLowerCase();
  return normalized in PHOTO_FORMATS ? normalized as PhotoFormat : 'us';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const validation = validateImageUpload(formData.get('image'));
    const format = getPhotoFormat(
      formData.get('format')
    );

    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: validation.status });
    const image = validation.file;

    const buffer = Buffer.from(
      await image.arrayBuffer()
    );

    /*
     * 이 API에서는 얼굴 배치나 크롭을 다시 하지 않는다.
     *
     * 얼굴 크기, 정수리 위치, 어깨 폭은
     * 클라이언트의 photo layout engine에서
     * 이미 완성된 상태로 전달되어야 한다.
     */
    const { width: targetWidth, height: targetHeight, filename } = PHOTO_FORMATS[format];

    const sourceMetadata = await sharp(buffer).metadata();
    const sourceWidth = sourceMetadata.width;
    const sourceHeight = sourceMetadata.height;

    if (!sourceWidth || !sourceHeight) {
      throw new Error('Final photo dimensions are unavailable.');
    }

    /*
     * Preserve canvas pixels that were already pure/near white before global
     * color correction. The color engine intentionally adjusts the subject,
     * but embassy background pixels must remain exact #FFFFFF.
     */
    const whiteBackgroundMask = await sharp(buffer)
      .removeAlpha()
      .greyscale()
      .threshold(250)
      .raw()
      .toBuffer();

    const whiteOverlay = await sharp({
      create: {
        width: sourceWidth,
        height: sourceHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .joinChannel(whiteBackgroundMask, {
        raw: {
          width: sourceWidth,
          height: sourceHeight,
          channels: 1,
        },
      })
      .png()
      .toBuffer();

    /*
     * Basic Photo must preserve the uploaded subject's original pixels and
     * skin tone. Retouching belongs to Embassy-Ready Upgrade, not Basic.
     */
    const backgroundProtectedBuffer = await sharp(buffer)
      .composite([{ input: whiteOverlay, blend: 'over' }])
      .toBuffer();

    const output = await sharp(backgroundProtectedBuffer)
      .resize(
        targetWidth,
        targetHeight,
        {
          /*
           * 이미 규격 비율로 만들어진 캔버스를
           * 그대로 출력 크기로 변환한다.
           *
           * cover, extract, top crop 사용 금지.
           */
          fit: 'fill',
        }
      )
      /*
       * Apply only a restrained output-size sharpen. Running it after resize
       * restores a little edge clarity without changing skin tone, facial
       * geometry, or introducing the crunchy halos of strong sharpening.
       */
      .sharpen({ sigma: 0.45 })
      .jpeg({
        quality: 98,
        chromaSubsampling: '4:4:4',
        mozjpeg: true,
      })
      .withMetadata({
        density: 300,
      })
      .toBuffer();

    return new NextResponse(
      new Uint8Array(output),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition':
            `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error(
      'FINAL PHOTO ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Final photo generation failed.',
      },
      {
        status: 500,
      }
    );
  }
}
