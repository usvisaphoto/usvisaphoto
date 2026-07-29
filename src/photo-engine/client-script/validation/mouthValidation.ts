export const mouthValidationScript = String.raw`
function inspectTeethPixels(
  sourceImage,
  lm,
  iw,
  ih
) {
  if (
    !sourceImage ||
    !Array.isArray(lm) ||
    lm.length < 292 ||
    !Number.isFinite(iw) ||
    !Number.isFinite(ih)
  ) {
    return {
      teethVisible: false,
      brightLowSaturationRatio: 0
    };
  }

  const leftCorner =
    lm[61];

  const rightCorner =
    lm[291];

  const upperInnerLip =
    lm[13];

  const lowerInnerLip =
    lm[14];

  const mouthLeftX =
    Math.min(
      leftCorner.x,
      rightCorner.x
    ) * iw;

  const mouthRightX =
    Math.max(
      leftCorner.x,
      rightCorner.x
    ) * iw;

  const innerTopY =
    Math.min(
      upperInnerLip.y,
      lowerInnerLip.y
    ) * ih;

  const innerBottomY =
    Math.max(
      upperInnerLip.y,
      lowerInnerLip.y
    ) * ih;

  const mouthWidth =
    mouthRightX -
    mouthLeftX;

  const innerGap =
    innerBottomY -
    innerTopY;

  if (
    mouthWidth < 4 ||
    innerGap < 1
  ) {
    return {
      teethVisible: false,
      brightLowSaturationRatio: 0
    };
  }

  /*
   * 입술 가장자리와 피부가 검사 영역에
   * 포함되는 것을 줄이기 위해 안쪽만 사용한다.
   */
  const cropLeft =
    Math.max(
      0,
      Math.floor(
        mouthLeftX +
        mouthWidth * 0.18
      )
    );

  const cropRight =
    Math.min(
      iw,
      Math.ceil(
        mouthRightX -
        mouthWidth * 0.18
      )
    );

  const cropTop =
    Math.max(
      0,
      Math.floor(
        innerTopY
      )
    );

  const cropBottom =
    Math.min(
      ih,
      Math.ceil(
        innerBottomY
      )
    );

  const cropWidth =
    Math.max(
      1,
      cropRight -
      cropLeft
    );

  const cropHeight =
    Math.max(
      1,
      cropBottom -
      cropTop
    );

  const canvas =
    document.createElement('canvas');

  canvas.width = iw;
  canvas.height = ih;

  const context =
    canvas.getContext(
      '2d',
      {
        willReadFrequently: true
      }
    );

  if (!context) {
    return {
      teethVisible: false,
      brightLowSaturationRatio: 0
    };
  }

  try {
    context.drawImage(
      sourceImage,
      0,
      0,
      iw,
      ih
    );
  } catch (error) {
    return {
      teethVisible: false,
      brightLowSaturationRatio: 0
    };
  }

  let imageData;

  try {
    imageData =
      context.getImageData(
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight
      );
  } catch (error) {
    return {
      teethVisible: false,
      brightLowSaturationRatio: 0
    };
  }

  const data =
    imageData.data;

  let brightLowSaturationPixels = 0;
  let validPixels = 0;

  for (
    let index = 0;
    index < data.length;
    index += 4
  ) {
    const red =
      data[index];

    const green =
      data[index + 1];

    const blue =
      data[index + 2];

    const maximum =
      Math.max(
        red,
        green,
        blue
      );

    const minimum =
      Math.min(
        red,
        green,
        blue
      );

    const saturationRange =
      maximum -
      minimum;

    const brightness =
      (
        red +
        green +
        blue
      ) / 3;

    /*
     * 치아는 입술·구강 내부보다 밝고
     * RGB 채널 차이가 작은 저채도 영역이다.
     */
    if (
      brightness > 158 &&
      saturationRange < 44 &&
      red > 145 &&
      green > 145 &&
      blue > 135
    ) {
      brightLowSaturationPixels += 1;
    }

    validPixels += 1;
  }

  const brightLowSaturationRatio =
    validPixels > 0
      ? brightLowSaturationPixels /
        validPixels
      : 0;

  const normalizedInnerGap =
    innerGap /
    Math.max(1, mouthWidth);

  const teethVisible =
    normalizedInnerGap > 0.018 &&
    brightLowSaturationRatio > 0.12;

  return {
    teethVisible,
    brightLowSaturationRatio
  };
}

function detectMouth(
  lm,
  sourceImage,
  iw,
  ih
) {
  const mouthOpen =
    Math.abs(
      lm[13].y -
      lm[14].y
    );

  const faceHeight =
    Math.abs(
      lm[152].y -
      lm[10].y
    );

  const mouthRatio =
    mouthOpen /
    Math.max(
      0.0001,
      faceHeight
    );

  const mouthOpened =
    mouthRatio > 0.055;

  const teethResult =
    inspectTeethPixels(
      sourceImage,
      lm,
      iw,
      ih
    );

  return {
    mouthRatio,
    mouthOpened,
    teethVisible:
      teethResult.teethVisible,

    teethPixelRatio:
      teethResult
        .brightLowSaturationRatio
  };
}
`;