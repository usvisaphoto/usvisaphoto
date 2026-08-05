import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { applyBasicColorEngine } from '@/lib/color-engine';

export const runtime = 'nodejs';

const US_WIDTH = 600;
const US_HEIGHT = 600;

/*
 * 3.5 × 4.5cm at 300 DPI
 *
 * 3.5cm ÷ 2.54 × 300 ≈ 413px
 * 4.5cm ÷ 2.54 × 300 ≈ 531px
 */
const INTERNATIONAL_WIDTH = 413;
const INTERNATIONAL_HEIGHT = 531;

type PhotoFormat = 'us' | 'international';

function getPhotoFormat(
  value: FormDataEntryValue | null
): PhotoFormat {
  return value === 'international'
    ? 'international'
    : 'us';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const image = formData.get('image');
    const format = getPhotoFormat(
      formData.get('format')
    );

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: 'No image file provided.',
        },
        {
          status: 400,
        }
      );
    }

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
    const targetWidth =
      format === 'international'
        ? INTERNATIONAL_WIDTH
        : US_WIDTH;

    const targetHeight =
      format === 'international'
        ? INTERNATIONAL_HEIGHT
        : US_HEIGHT;

    const filename =
      format === 'international'
        ? 'international_visa_photo_35x45mm.jpg'
        : 'us_visa_photo.jpg';

    const colorCorrectedBuffer = await applyBasicColorEngine(buffer);

    const output = await sharp(colorCorrectedBuffer)
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