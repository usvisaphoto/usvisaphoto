export const professionalPhotoLayoutLogic = String.raw`
const PROFESSIONAL_PHOTO_SPECS = Object.freeze({
  us: Object.freeze({
    width: 600,
    height: 600,

    // 미국 2×2 inch 실제 높이: 50.8mm
    physicalHeightMm: 50.8,

    // 정수리부터 턱까지 2.8cm
    headLengthMm: 28,

    /*
 * crownY 검출점이 실제 머리카락 최상단보다 아래로 잡히는 오차 보정.
 * 현재 출력 약 32mm → 목표 28mm이므로 28 / 32 = 0.875
 */


    // 머리 위 약 5mm 여백
    topMarginMm: 5,

    // 미국 비자는 어깨를 충분히 넓게
    shoulderExpandRatio: 1,

    jpegQuality: 0.99,
  }),

  international: Object.freeze({
  /*
   * 3.5 × 4.5 cm, 300 DPI
   *
   * 35mm ÷ 25.4 × 300 = 약 413px
   * 45mm ÷ 25.4 × 300 = 약 531px
   */
  width: 413,
  height: 531,

  physicalHeightMm: 45,

  /*
   * 실제 결과가 약 30mm로 확인되어
   * 목표 32mm가 되도록 생성 목표를 보정한다.
   *
   * 32 ÷ 30 = 약 1.0667
   * 32 × 1.0667 = 약 34.13mm
   */
  headLengthMm: 28,

  topMarginMm: 5.5,

  shoulderExpandRatio: 1,

  jpegQuality: 0.99,
}),
  '35x45': Object.freeze({ width:413,height:531,physicalHeightMm:45,headLengthMm:28,topMarginMm:4,shoulderExpandRatio:1,jpegQuality:.99 }),
  '2x2': Object.freeze({ width:600,height:600,physicalHeightMm:50.8,headLengthMm:28,topMarginMm:5,shoulderExpandRatio:1,jpegQuality:.99 }),
  // Korean 3 × 4cm half-name-card portrait: the face occupies about one
  // third of the full photo height so considerably more upper body remains.
  '30x40': Object.freeze({ width:354,height:472,physicalHeightMm:40,headLengthMm:13.3,topMarginMm:4,shoulderExpandRatio:1,jpegQuality:.99 }),
  '20x30': Object.freeze({ width:236,height:354,physicalHeightMm:30,headLengthMm:22,topMarginMm:3,shoulderExpandRatio:1,jpegQuality:.99 }),
  '40x60': Object.freeze({ width:472,height:709,physicalHeightMm:60,headLengthMm:34,topMarginMm:5,shoulderExpandRatio:1,jpegQuality:.99 }),
  '50x70': Object.freeze({width:591,height:827,physicalHeightMm:70,headLengthMm:34,topMarginMm:5,shoulderExpandRatio:1,jpegQuality:.99}),
});

function getProfessionalPhotoSpec(format) {
  if (format === 'country-default') {
    const profile = window.EMBASSY_PHOTO_PROFILE || {};
    return {
      width: Number(profile.pixelWidth || 600),
      height: Number(profile.pixelHeight || 600),
      physicalHeightMm: Number(profile.heightMm || 50.8),
      headLengthMm: Number(profile.headHeightMm || 28),
      topMarginMm: Number(profile.topMarginMm || 5),
      shoulderExpandRatio: 1,
      jpegQuality: .99,
    };
  }
  const spec =
    PROFESSIONAL_PHOTO_SPECS[format];

  if (!spec) {
    throw new Error(
      'Unsupported professional photo format: ' +
      String(format)
    );
  }

  return spec;
}

async function resolveProfessionalSourceImage(
  sourceInput
) {
  if (
    sourceInput instanceof HTMLImageElement &&
    sourceInput.complete &&
    sourceInput.naturalWidth > 0
  ) {
    return sourceInput;
  }

  if (
    sourceInput instanceof HTMLCanvasElement
  ) {
    const image =
      new Image();

    image.decoding = 'async';

    image.src =
      sourceInput.toDataURL(
        'image/png'
      );

    await image.decode();

    return image;
  }

  if (typeof sourceInput === 'string') {
    const image =
      new Image();

    image.decoding = 'async';
    image.crossOrigin = 'anonymous';
    image.src = sourceInput;

    await image.decode();

    return image;
  }

  throw new Error(
    'Professional source image is invalid.'
  );
}

function calculateProfessionalTargetHeadPx(
  spec
) {
  return (
    spec.height *
    (
      spec.headLengthMm /
      spec.physicalHeightMm
    )
  );
}

function calculateProfessionalTopMarginPx(
  spec
) {
  return (
    spec.height *
    (
      spec.topMarginMm /
      spec.physicalHeightMm
    )
  );
}

function createWhiteCanvas(
  width,
  height
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext('2d');

  if (!context) {
    throw new Error(
      'Professional canvas context unavailable.'
    );
  }

  context.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );

  context.clearRect(
    0,
    0,
    width,
    height
  );

  context.fillStyle = '#ffffff';

  context.fillRect(
    0,
    0,
    width,
    height
  );

  return {
    canvas,
    context,
  };
}

/*
 * 얼굴은 그대로 유지하고
 * 턱 아래의 목·승모근·어깨·상체만
 * 점진적으로 가로 확장한다.
 *
 * 한 줄에서 갑자기 넓히지 않고
 * feather 영역을 사용해 경계가 보이지 않게 한다.
 */
function expandProfessionalShoulders({
  sourceCanvas,
  shoulderStartY,
  expandRatio,
}) {
  const width =
    sourceCanvas.width;

  const height =
    sourceCanvas.height;

  const result =
    createWhiteCanvas(
      width,
      height
    );

  const outputCanvas =
    result.canvas;

  const outputContext =
    result.context;

  const safeStartY =
    Math.max(
      0,
      Math.min(
        height - 1,
        Math.round(
          shoulderStartY
        )
      )
    );

  /*
   * 얼굴과 머리 부분은
   * 픽셀 변형 없이 그대로 복사한다.
   */
  outputContext.drawImage(
    sourceCanvas,
    0,
    0,
    width,
    safeStartY,
    0,
    0,
    width,
    safeStartY
  );

  /*
   * 어깨 확장이 자연스럽게 시작되도록
   * 약 9% 높이를 전환 구간으로 사용한다.
   */
  const featherHeight =
    Math.max(
      36,
      Math.round(
        height * 0.09
      )
    );

  const stripHeight = 4;

  for (
    let y = safeStartY;
    y < height;
    y += stripHeight
  ) {
    const currentStripHeight =
      Math.min(
        stripHeight,
        height - y
      );

    const progress =
      Math.min(
        1,
        Math.max(
          0,
          (
            y -
            safeStartY
          ) /
          featherHeight
        )
      );

    /*
     * 부드러운 곡선으로 1.0에서
     * 목표 어깨 확장 비율까지 증가한다.
     */
    const smoothProgress =
      progress *
      progress *
      (
        3 -
        2 * progress
      );

    const currentRatio =
      1 +
      (
        expandRatio - 1
      ) *
      smoothProgress;

    const sourceWidth =
      width /
      currentRatio;

    const sourceX =
      (
        width -
        sourceWidth
      ) /
      2;

    outputContext.drawImage(
      sourceCanvas,

      sourceX,
      y,
      sourceWidth,
      currentStripHeight,

      0,
      y,
      width,
      currentStripHeight
    );
  }

  return outputCanvas;
}

/*
 * sourceInput:
 * HTMLImageElement, Canvas 또는 이미지 URL
 *
 * crownY:
 * 원본 이미지에서 정수리 Y 좌표
 *
 * chinY:
 * 원본 이미지에서 턱끝 Y 좌표
 *
 * faceCenterX:
 * 원본 이미지에서 얼굴 중심 X 좌표
 *
 * faceTiltAngle:
 * 라디안 단위 얼굴 기울기
 */
async function createProfessionalPhotoLayout({
  sourceInput,
  format,
  crownY,
  chinY,
  faceCenterX,
  faceTiltAngle,
}) {
  const spec =
    getProfessionalPhotoSpec(
      format
    );

  const sourceImage =
    await resolveProfessionalSourceImage(
      sourceInput
    );

  const numericCrownY =
    Number(crownY);

  const numericChinY =
    Number(chinY);

  const numericFaceCenterX =
    Number(faceCenterX);

  const numericTilt =
    Number(
      faceTiltAngle || 0
    );

  if (
    !Number.isFinite(
      numericCrownY
    ) ||
    !Number.isFinite(
      numericChinY
    ) ||
    numericChinY <=
      numericCrownY
  ) {
    throw new Error(
      'Professional head coordinates are invalid.'
    );
  }

  if (
    !Number.isFinite(
      numericFaceCenterX
    )
  ) {
    throw new Error(
      'Professional face center is invalid.'
    );
  }

  const currentHeadPx =
    numericChinY -
    numericCrownY;

  const targetHeadPx =
    calculateProfessionalTargetHeadPx(
      spec
    );

  /*
   * 미국:
   * 600 × 28 ÷ 50.8
   * 약 330.7px
   *
   * 국제:
   * 1350 × 32 ÷ 45
   * 960px
   */
 const scale =
  targetHeadPx /
  currentHeadPx;

  const topMarginPx =
    calculateProfessionalTopMarginPx(
      spec
    );

  const aligned =
    createWhiteCanvas(
      spec.width,
      spec.height
    );

  const alignedCanvas =
    aligned.canvas;

  const alignedContext =
    aligned.context;

  /*
   * 정수리를 지정된 상단 여백 위치에 놓고
   * 얼굴 중심을 사진 가로 중앙에 맞춘다.
   */
  alignedContext.save();

  alignedContext.translate(
    spec.width / 2,
    topMarginPx
  );

  alignedContext.rotate(
    -numericTilt
  );

  alignedContext.scale(
    scale,
    scale
  );

  alignedContext.drawImage(
    sourceImage,
    -numericFaceCenterX,
    -numericCrownY
  );

  alignedContext.restore();

  /*
   * 턱 바로 아래부터 확장하면
   * 턱선이 늘어날 수 있으므로
   * 턱보다 약간 아래에서 어깨 확장을 시작한다.
   */
  const shoulderStartY =
    topMarginPx +
    targetHeadPx *
      1.07;

  const finalCanvas =
  spec.shoulderExpandRatio > 1.001
    ? expandProfessionalShoulders({
        sourceCanvas:
          alignedCanvas,

        shoulderStartY,

        expandRatio:
          spec.shoulderExpandRatio,
      })
    : alignedCanvas;

  return finalCanvas.toDataURL(
    'image/jpeg',
    spec.jpegQuality
  );
}

/*
 * logic.ts에서 호출할 수 있도록
 * iframe window 전역에 등록한다.
 */
window.createProfessionalPhotoLayout =
  createProfessionalPhotoLayout;
`;
