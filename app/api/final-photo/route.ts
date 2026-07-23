import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

function getPhotoFormat(value: FormDataEntryValue | null): PhotoFormat {
  return value === 'international'
    ? 'international'
    : 'us';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const image = formData.get('image');
    const format = getPhotoFormat(formData.get('format'));
    const foreheadY = Number(formData.get('foreheadY'));
    const chinY = Number(formData.get('chinY'));
    const faceHeight = Number(formData.get('faceHeight'));
    const imageWidth = Number(formData.get('imageWidth'));
    const imageHeight = Number(formData.get('imageHeight'));
    
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

    if (format === 'international') {
  /*
   * 이미 완성된 600×600 US 사진을
   * 3.5×4.5 비율로 자연스럽게 변환합니다.
   *
   * 사진 높이를 531px에 맞춘 뒤
   * 좌우만 중앙 기준으로 최소 크롭합니다.
   *
   * 얼굴을 별도로 확대하지 않으므로
   * 얼굴·어깨 비율이 과도하게 커지지 않습니다.
   */
  const resizedWidth = 610;
  const resizedHeight = 610;

  const left = Math.floor(
    (resizedWidth - INTERNATIONAL_WIDTH) / 2
  );

  const output = await sharp(buffer)
    .resize(resizedWidth, resizedHeight, {
      fit: 'fill',
    })
    .extract({
      left,
      top: 28,
      width: INTERNATIONAL_WIDTH,
      height: INTERNATIONAL_HEIGHT,
    })
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
          'attachment; filename="international_visa_photo_35x45mm.jpg"',
        'Cache-Control': 'no-store',
      },
    }
  );
}
    /*
     * 기본 미국 비자/여권 사진
     * 2 × 2 inch, 600 × 600px, 300 DPI
     */
    const output = await sharp(buffer)
      .resize(US_WIDTH, US_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
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
            'attachment; filename="us_visa_photo.jpg"',
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
        error: 'Final photo generation failed.',
      },
      {
        status: 500,
      }
    );
  }
}