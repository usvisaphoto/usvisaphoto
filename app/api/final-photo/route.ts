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

/*
 * 기존 미국 비자 사진의 얼굴 길이: 2.8cm
 * 국제 규격 목표 얼굴 길이: 3.2cm
 */
const US_FACE_HEIGHT_CM = 2.8;
const INTERNATIONAL_FACE_HEIGHT_CM = 3.28;

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
       * 2.8cm 얼굴을 3.2cm 얼굴로 확대하는 비율
       * 약 1.142857
       */
      const scale =
        INTERNATIONAL_FACE_HEIGHT_CM /
        US_FACE_HEIGHT_CM;

      const resizedSize = Math.round(
        US_WIDTH * scale
      );

      /*
       * 상단 여백은 그대로 유지하고,
       * 좌우만 중앙 기준으로 잘라냅니다.
       */
      const left = Math.max(
        0,
        Math.floor(
          (resizedSize - INTERNATIONAL_WIDTH) / 2
        )
      );

     /*
 * 원본 US 사진의 머리 위 여백은 약 0.55cm.
 * 3.2cm 얼굴 크기로 확대된 뒤 위쪽을 약 27px만 잘라
 * 국제사진의 머리 위 여백을 약 0.4cm로 맞춘다.
 */
const top = 38;

const output = await sharp(buffer)
  .resize(resizedSize, resizedSize, {
    fit: 'fill',
  })
  .extract({
    left,
    top,
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