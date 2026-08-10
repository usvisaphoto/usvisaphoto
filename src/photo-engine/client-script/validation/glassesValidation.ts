export const glassesValidationScript = String.raw`
/*
 * Glasses Detection V2
 *
 * 검사 방식:
 * 1. 양쪽 볼에서 피부 기준색을 계산한다.
 * 2. 눈동자 자체가 아닌 눈 주위 프레임 영역만 검사한다.
 * 3. 피부색과의 RGB 차이, 밝기 차이, 픽셀 경계를 함께 계산한다.
 * 4. 위·아래·바깥·안쪽 프레임 구간의 연속성을 검사한다.
 * 5. 코 위 안경 브리지 유무를 검사한다.
 * 6. 좌우 눈에서 대칭적인 프레임 패턴이 있을 때만 안경으로 판정한다.
 */

function glassesClamp(
  value,
  minimum,
  maximum
) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function glassesCreateImageContext(
  sourceImage,
  iw,
  ih
) {
  if (
    !sourceImage ||
    !Number.isFinite(iw) ||
    !Number.isFinite(ih) ||
    iw <= 0 ||
    ih <= 0
  ) {
    return null;
  }

  const canvas =
    document.createElement('canvas');

  canvas.width =
    Math.max(1, Math.round(iw));

  canvas.height =
    Math.max(1, Math.round(ih));

  const context =
    canvas.getContext(
      '2d',
      {
        willReadFrequently: true
      }
    );

  if (!context) {
    return null;
  }

  try {
    context.drawImage(
      sourceImage,
      0,
      0,
      canvas.width,
      canvas.height
    );

   console.log("GLASSES IMAGE", {
  width: canvas.width,
  height: canvas.height,
  source:
    sourceImage &&
    typeof sourceImage.src === 'string'
      ? sourceImage.src
      : null,
  object: sourceImage
});

  } catch (error) {
    console.warn(
      'Glasses validation image could not be drawn:',
      error
    );

    return null;
  }

  return {
    canvas,
    context
  };
}

function glassesGetPixel(
  context,
  x,
  y,
  iw,
  ih
) {
  const safeX =
    glassesClamp(
      Math.round(x),
      0,
      iw - 1
    );

  const safeY =
    glassesClamp(
      Math.round(y),
      0,
      ih - 1
    );

  try {
    const pixel =
      context.getImageData(
        safeX,
        safeY,
        1,
        1
      ).data;

    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2]
    };
  } catch (error) {
    return null;
  }
}

function glassesRgbToLuminance(
  red,
  green,
  blue
) {
  return (
    red * 0.299 +
    green * 0.587 +
    blue * 0.114
  );
}

function glassesRgbRange(
  red,
  green,
  blue
) {
  return (
    Math.max(
      red,
      green,
      blue
    ) -
    Math.min(
      red,
      green,
      blue
    )
  );
}

function glassesColorDistance(
  firstColor,
  secondColor
) {
  if (
    !firstColor ||
    !secondColor
  ) {
    return 0;
  }

  const redDifference =
    firstColor.r -
    secondColor.r;

  const greenDifference =
    firstColor.g -
    secondColor.g;

  const blueDifference =
    firstColor.b -
    secondColor.b;

  return Math.sqrt(
    redDifference *
      redDifference +
    greenDifference *
      greenDifference +
    blueDifference *
      blueDifference
  );
}

function glassesMedian(values) {
  if (!values.length) {
    return 0;
  }

  const sorted =
    values
      .slice()
      .sort(
        function (
          firstValue,
          secondValue
        ) {
          return (
            firstValue -
            secondValue
          );
        }
      );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 1
  ) {
    return sorted[middle];
  }

  return (
    sorted[middle - 1] +
    sorted[middle]
  ) / 2;
}

function glassesSamplePatch(
  context,
  centerX,
  centerY,
  radiusX,
  radiusY,
  iw,
  ih
) {
  const reds = [];
  const greens = [];
  const blues = [];

  const startX =
    glassesClamp(
      Math.floor(
        centerX -
        radiusX
      ),
      0,
      iw - 1
    );

  const endX =
    glassesClamp(
      Math.ceil(
        centerX +
        radiusX
      ),
      startX + 1,
      iw
    );

  const startY =
    glassesClamp(
      Math.floor(
        centerY -
        radiusY
      ),
      0,
      ih - 1
    );

  const endY =
    glassesClamp(
      Math.ceil(
        centerY +
        radiusY
      ),
      startY + 1,
      ih
    );

  const stepX =
    Math.max(
      1,
      Math.floor(
        (
          endX -
          startX
        ) / 8
      )
    );

  const stepY =
    Math.max(
      1,
      Math.floor(
        (
          endY -
          startY
        ) / 8
      )
    );

  for (
    let y = startY;
    y < endY;
    y += stepY
  ) {
    for (
      let x = startX;
      x < endX;
      x += stepX
    ) {
      const color =
        glassesGetPixel(
          context,
          x,
          y,
          iw,
          ih
        );

      if (!color) {
        continue;
      }

      /*
       * 머리카락, 배경, 완전히 어두운 픽셀이
       * 피부 기준색 계산에 섞이지 않게 제외한다.
       */
      const luminance =
        glassesRgbToLuminance(
          color.r,
          color.g,
          color.b
        );

      if (
        luminance < 55 ||
        luminance > 252
      ) {
        continue;
      }

      reds.push(color.r);
      greens.push(color.g);
      blues.push(color.b);
    }
  }

  if (
    reds.length < 3
  ) {
    return null;
  }

  return {
    r: glassesMedian(reds),
    g: glassesMedian(greens),
    b: glassesMedian(blues)
  };
}

function glassesAverageColors(
  colors
) {
  const validColors =
    colors.filter(Boolean);

  if (!validColors.length) {
    return null;
  }

  const reds =
    validColors.map(
      function (color) {
        return color.r;
      }
    );

  const greens =
    validColors.map(
      function (color) {
        return color.g;
      }
    );

  const blues =
    validColors.map(
      function (color) {
        return color.b;
      }
    );

  return {
    r: glassesMedian(reds),
    g: glassesMedian(greens),
    b: glassesMedian(blues)
  };
}

function glassesGetSkinReference(
  context,
  lm,
  iw,
  ih
) {
  /*
   * 볼 중앙에 가까운 FaceMesh 좌표를 사용한다.
   * 눈썹, 눈동자, 입술, 머리카락 영역은 피한다.
   */
  const leftCheek =
    lm[205];

  const rightCheek =
    lm[425];

  const leftLowerCheek =
    lm[123];

  const rightLowerCheek =
    lm[352];

  const faceWidth =
    Math.max(
      10,
      Math.abs(
        lm[454].x -
        lm[234].x
      ) * iw
    );

  const patchRadiusX =
    Math.max(
      3,
      faceWidth * 0.035
    );

  const patchRadiusY =
    Math.max(
      3,
      faceWidth * 0.028
    );

  const skinColors = [];

  [
    leftCheek,
    rightCheek,
    leftLowerCheek,
    rightLowerCheek
  ].forEach(
    function (landmark) {
      if (!landmark) {
        return;
      }

      skinColors.push(
        glassesSamplePatch(
          context,
          landmark.x * iw,
          landmark.y * ih,
          patchRadiusX,
          patchRadiusY,
          iw,
          ih
        )
      );
    }
  );

  return glassesAverageColors(
    skinColors
  );
}

function glassesAnalyzeRectangle({
  context,
  iw,
  ih,
  left,
  top,
  right,
  bottom,
  skinColor
}) {
  const safeLeft =
    glassesClamp(
      Math.floor(left),
      0,
      iw - 1
    );

  const safeRight =
    glassesClamp(
      Math.ceil(right),
      safeLeft + 1,
      iw
    );

  const safeTop =
    glassesClamp(
      Math.floor(top),
      0,
      ih - 1
    );

  const safeBottom =
    glassesClamp(
      Math.ceil(bottom),
      safeTop + 1,
      ih
    );

  const width =
    Math.max(
      1,
      safeRight - safeLeft
    );

  const height =
    Math.max(
      1,
      safeBottom - safeTop
    );

  let imageData;

  try {
    imageData =
      context.getImageData(
        safeLeft,
        safeTop,
        width,
        height
      );
  } catch (error) {
    return {
      candidateRatio: 0,
      edgeRatio: 0,
      darkRatio: 0,
      skinDifferenceRatio: 0,
      continuity: 0
    };
  }

  const data =
    imageData.data;

  const pixelCount =
    width * height;

  const grayscale =
    new Float32Array(pixelCount);

  const candidateMask =
    new Uint8Array(pixelCount);

  const supportedMask =
    new Uint8Array(pixelCount);

  const skinLuminance =
    skinColor
      ? glassesRgbToLuminance(
          skinColor.r,
          skinColor.g,
          skinColor.b
        )
      : 175;

  let darkPixels = 0;
  let skinDifferentPixels = 0;

  /*
   * 1차 후보 생성
   *
   * 기존 코드의
   * luminanceDifference > 42
   * 단독 조건을 제거한다.
   *
   * 이 조건이 흰자, 눈꺼풀, 하이라이트까지
   * 안경테로 판정하던 주원인이었다.
   */
  for (
    let y = 0;
    y < height;
    y += 1
  ) {
    for (
      let x = 0;
      x < width;
      x += 1
    ) {
      const pixelIndex =
        y * width + x;

      const dataIndex =
        pixelIndex * 4;

      const red =
        data[dataIndex];

      const green =
        data[dataIndex + 1];

      const blue =
        data[dataIndex + 2];

      const luminance =
        glassesRgbToLuminance(
          red,
          green,
          blue
        );

      grayscale[pixelIndex] =
        luminance;

      const colorDistance =
        skinColor
          ? glassesColorDistance(
              {
                r: red,
                g: green,
                b: blue
              },
              skinColor
            )
          : 0;

      const luminanceDifference =
        Math.abs(
          luminance -
          skinLuminance
        );

      const saturationRange =
        glassesRgbRange(
          red,
          green,
          blue
        );

      /*
       * 검정·갈색 플라스틱테 후보
       */
      const darkFrameCandidate =
  colorDistance > 36 &&
  luminance <
    skinLuminance - 24 &&
  luminance < 190;

const metallicFrameCandidate =
  colorDistance > 30 &&
  saturationRange < 46 &&
  luminanceDifference > 22 &&
  luminance > 55 &&
  luminance < 235;

      if (
        luminance <
        skinLuminance - 38
      ) {
        darkPixels += 1;
      }

      if (colorDistance > 48) {
        skinDifferentPixels += 1;
      }

      if (
        darkFrameCandidate ||
        metallicFrameCandidate
      ) {
        candidateMask[pixelIndex] = 1;
      }
    }
  }

  let strongEdges = 0;
  let edgeSamples = 0;
  let supportedCandidatePixels = 0;

  const rowSupportedCounts =
    new Array(height).fill(0);

  const columnSupportedCounts =
    new Array(width).fill(0);

  /*
   * 프레임 후보이면서 실제 경계선이 있는 픽셀만
   * 최종 후보로 인정한다.
   *
   * 넓은 눈동자·흰자·피부 음영은 여기서 제외된다.
   */
  for (
    let y = 1;
    y < height - 1;
    y += 1
  ) {
    for (
      let x = 1;
      x < width - 1;
      x += 1
    ) {
      const pixelIndex =
        y * width + x;

      const horizontalDifference =
        Math.abs(
          grayscale[pixelIndex + 1] -
          grayscale[pixelIndex - 1]
        );

      const verticalDifference =
        Math.abs(
          grayscale[
            pixelIndex + width
          ] -
          grayscale[
            pixelIndex - width
          ]
        );

      const gradient =
        horizontalDifference +
        verticalDifference;

      const strongEdge =
        gradient > 42;

      if (strongEdge) {
        strongEdges += 1;
      }

      if (
        candidateMask[pixelIndex] &&
        gradient > 32
      ) {
        supportedMask[pixelIndex] = 1;

        supportedCandidatePixels += 1;

        rowSupportedCounts[y] += 1;
        columnSupportedCounts[x] += 1;
      }

      edgeSamples += 1;
    }
  }

  let continuousRows = 0;

  for (
    let row = 0;
    row < height;
    row += 1
  ) {
    if (
      rowSupportedCounts[row] >=
      Math.max(
        2,
        width * 0.12
      )
    ) {
      continuousRows += 1;
    }
  }

  let continuousColumns = 0;

  for (
    let column = 0;
    column < width;
    column += 1
  ) {
    if (
      columnSupportedCounts[column] >=
      Math.max(
        2,
        height * 0.12
      )
    ) {
      continuousColumns += 1;
    }
  }

  const rowContinuity =
    height > 0
      ? continuousRows / height
      : 0;

  const columnContinuity =
    width > 0
      ? continuousColumns / width
      : 0;

  return {
    /*
     * 단순 색상 후보가 아니라
     * 경계선이 동반된 후보 비율을 사용한다.
     */
    candidateRatio:
      pixelCount > 0
        ? supportedCandidatePixels /
          pixelCount
        : 0,

    edgeRatio:
      edgeSamples > 0
        ? strongEdges /
          edgeSamples
        : 0,

    darkRatio:
      pixelCount > 0
        ? darkPixels /
          pixelCount
        : 0,

    skinDifferenceRatio:
      pixelCount > 0
        ? skinDifferentPixels /
          pixelCount
        : 0,

    continuity:
      Math.max(
        rowContinuity,
        columnContinuity
      )
  };
}
function glassesBuildEyeGeometry(
  outerLandmark,
  innerLandmark,
  iw,
  ih
) {
  const centerX =
    (
      outerLandmark.x +
      innerLandmark.x
    ) *
    iw /
    2;

  const centerY =
    (
      outerLandmark.y +
      innerLandmark.y
    ) *
    ih /
    2;

  const width =
    Math.max(
      4,
      Math.abs(
        innerLandmark.x -
        outerLandmark.x
      ) * iw
    );

  return {
    centerX,
    centerY,
    width
  };
}

function glassesInspectEyeFrame(
  context,
  iw,
  ih,
  geometry,
  skinColor,
  side
) {
  const centerX =
    geometry.centerX;

  const centerY =
    geometry.centerY;

  const eyeWidth =
    geometry.width;

  const topBand =
    glassesAnalyzeRectangle({
      context,
      iw,
      ih,
      skinColor,

      left:
        centerX -
        eyeWidth * 0.72,

      right:
        centerX +
        eyeWidth * 0.72,

      top:
        centerY -
        eyeWidth * 0.48,

      bottom:
        centerY -
        eyeWidth * 0.15
    });

  const bottomBand =
    glassesAnalyzeRectangle({
      context,
      iw,
      ih,
      skinColor,

      left:
        centerX -
        eyeWidth * 0.70,

      right:
        centerX +
        eyeWidth * 0.70,

      top:
        centerY +
        eyeWidth * 0.12,

      bottom:
        centerY +
        eyeWidth * 0.48
    });

  const outerDirection =
    side === 'left'
      ? -1
      : 1;

  const outerBandCenter =
    centerX +
    outerDirection *
      eyeWidth *
      0.69;

  const outerBand =
    glassesAnalyzeRectangle({
      context,
      iw,
      ih,
      skinColor,

      left:
        outerBandCenter -
        eyeWidth * 0.18,

      right:
        outerBandCenter +
        eyeWidth * 0.18,

      top:
        centerY -
        eyeWidth * 0.42,

      bottom:
        centerY +
        eyeWidth * 0.42
    });

  const innerDirection =
    side === 'left'
      ? 1
      : -1;

  const innerBandCenter =
    centerX +
    innerDirection *
      eyeWidth *
      0.61;

  const innerBand =
    glassesAnalyzeRectangle({
      context,
      iw,
      ih,
      skinColor,

      left:
        innerBandCenter -
        eyeWidth * 0.16,

      right:
        innerBandCenter +
        eyeWidth * 0.16,

      top:
        centerY -
        eyeWidth * 0.36,

      bottom:
        centerY +
        eyeWidth * 0.36
    });

 function bandHasFrame(
  band,
  minimumCandidateRatio
) {
  return (
    band.candidateRatio >
      minimumCandidateRatio * 0.65 &&
    (
      (
        band.edgeRatio > 0.055 &&
        band.continuity > 0.06
      ) ||
      band.edgeRatio > 0.10 ||
      band.continuity > 0.16
    )
  );
}
  const topDetected =
    bandHasFrame(
      topBand,
      0.025
    );

  const bottomDetected =
    bandHasFrame(
      bottomBand,
      0.020
    );

  const outerDetected =
    bandHasFrame(
      outerBand,
      0.022
    );

  const innerDetected =
    bandHasFrame(
      innerBand,
      0.020
    );

    console.log("LEFT/RIGHT SEGMENTS", {
    side,
    topDetected,
    bottomDetected,
    outerDetected,
    innerDetected,
    topBand,
    bottomBand,
    outerBand,
    innerBand
});

  const detectedSegments = [
    topDetected,
    bottomDetected,
    outerDetected,
    innerDetected
  ].filter(Boolean).length;

  /*
   * 실제 안경테는 위·아래 경계와
   * 좌우 측면 경계가 함께 나타난다.
   *
   * 눈썹이나 눈꺼풀만 검출된 경우는
   * frameDetected가 되지 않는다.
   */
  const horizontalStructure =
    topDetected &&
    bottomDetected;

  const verticalStructure =
  outerDetected;

  const averageCandidateRatio =
    (
      topBand.candidateRatio +
      bottomBand.candidateRatio +
      outerBand.candidateRatio +
      innerBand.candidateRatio
    ) / 4;

  const averageEdgeRatio =
    (
      topBand.edgeRatio +
      bottomBand.edgeRatio +
      outerBand.edgeRatio +
      innerBand.edgeRatio
    ) / 4;

  const averageContinuity =
    (
      topBand.continuity +
      bottomBand.continuity +
      outerBand.continuity +
      innerBand.continuity
    ) / 4;

  const frameDetected =
    detectedSegments >= 3 &&
    horizontalStructure &&
    verticalStructure;

  const score =
    glassesClamp(
      averageCandidateRatio *
        4.0 +
      averageEdgeRatio *
        1.8 +
      averageContinuity *
        1.4 +
      detectedSegments *
        0.08,
      0,
      1
    );


console.log(
  "EYE BAND DETAIL",
  side,
  {
    topBand,
    bottomBand,
    outerBand,
    innerBand
  }
);


  return {
    frameDetected,
    score,
    detectedSegments,
    topDetected,
    bottomDetected,
    outerDetected,
    innerDetected,
    averageCandidateRatio,
    averageEdgeRatio,
    averageContinuity
  };
}
function glassesInspectBridge(
  context,
  iw,
  ih,
  leftGeometry,
  rightGeometry,
  skinColor
) {
  const leftInnerX =
    leftGeometry.centerX +
    leftGeometry.width * 0.48;

  const rightInnerX =
    rightGeometry.centerX -
    rightGeometry.width * 0.48;

  const bridgeCenterY =
    (
      leftGeometry.centerY +
      rightGeometry.centerY
    ) / 2;

  const averageEyeWidth =
    (
      leftGeometry.width +
      rightGeometry.width
    ) / 2;

  /*
   * 코 중앙의 넓은 그림자를 피하고,
   * 실제 안경 브리지가 놓이는 얇은 수평 구역만 검사한다.
   */
  const bridge =
    glassesAnalyzeRectangle({
      context,
      iw,
      ih,
      skinColor,

      left:
        Math.min(
          leftInnerX,
          rightInnerX
        ) +
        averageEyeWidth * 0.08,

      right:
        Math.max(
          leftInnerX,
          rightInnerX
        ) -
        averageEyeWidth * 0.08,

      top:
        bridgeCenterY -
        averageEyeWidth * 0.09,

      bottom:
        bridgeCenterY +
        averageEyeWidth * 0.07
    });

  /*
   * 실제 브리지는:
   * - 후보 픽셀이 충분하고
   * - 경계선이 강하며
   * - 수평 연속성이 높아야 한다.
   *
   * 코 그림자처럼 넓고 부드러운 음영은 제외한다.
   */
  const detected =
    bridge.candidateRatio > 0.045 &&
    bridge.edgeRatio > 0.11 &&
    bridge.continuity > 0.18;

  const score =
    glassesClamp(
      bridge.candidateRatio * 2.5 +
      bridge.edgeRatio * 2.2 +
      bridge.continuity * 1.8,
      0,
      1
    );

  return {
    detected,
    score,

    candidateRatio:
      bridge.candidateRatio,

    edgeRatio:
      bridge.edgeRatio,

    continuity:
      bridge.continuity
  };
}

function detectGlassesValidation(
  sourceImage,
  lm,
  iw,
  ih
) {

console.log(
    "DETECT GLASSES SOURCE",
    sourceImage
);

  const emptyResult = {
    glassesDetected: false,
    confidence: 0,

    leftEyeScore: 0,
    rightEyeScore: 0,
    bridgeScore: 0,

    leftSegments: 0,
    rightSegments: 0,

    bridgeDetected: false
  };

  if (
    !sourceImage ||
    !Array.isArray(lm) ||
    lm.length < 455 ||
    !Number.isFinite(iw) ||
    !Number.isFinite(ih) ||
    iw <= 0 ||
    ih <= 0
  ) {
    return emptyResult;
  }

  const imageContext =
    glassesCreateImageContext(
      sourceImage,
      iw,
      ih
    );

  if (!imageContext) {
    return emptyResult;
  }

  const context =
    imageContext.context;

  const skinColor =
    glassesGetSkinReference(
      context,
      lm,
      iw,
      ih
    );

  if (!skinColor) {
    return emptyResult;
  }

  const leftGeometry =
    glassesBuildEyeGeometry(
      lm[33],
      lm[133],
      iw,
      ih
    );

  const rightGeometry =
    glassesBuildEyeGeometry(
      lm[263],
      lm[362],
      iw,
      ih
    );

  const leftFrame =
    glassesInspectEyeFrame(
      context,
      iw,
      ih,
      leftGeometry,
      skinColor,
      'left'
    );

  const rightFrame =
    glassesInspectEyeFrame(
      context,
      iw,
      ih,
      rightGeometry,
      skinColor,
      'right'
    );

  const bridge =
    glassesInspectBridge(
      context,
      iw,
      ih,
      leftGeometry,
      rightGeometry,
      skinColor
    );

  /*
   * 기본 판정:
   * 좌우 프레임이 모두 검출되면 안경이다.
   */

console.log(
  '========== GLASSES RAW METRICS =========='
);

console.log({
  leftFrame: {
    frameDetected:
      leftFrame.frameDetected,

    score:
      leftFrame.score,

    detectedSegments:
      leftFrame.detectedSegments,

    topDetected:
      leftFrame.topDetected,

    bottomDetected:
      leftFrame.bottomDetected,

    outerDetected:
      leftFrame.outerDetected,

    innerDetected:
      leftFrame.innerDetected,

    averageCandidateRatio:
      leftFrame.averageCandidateRatio,

    averageEdgeRatio:
      leftFrame.averageEdgeRatio,

    averageContinuity:
      leftFrame.averageContinuity
  },

  rightFrame: {
    frameDetected:
      rightFrame.frameDetected,

    score:
      rightFrame.score,

    detectedSegments:
      rightFrame.detectedSegments,

    topDetected:
      rightFrame.topDetected,

    bottomDetected:
      rightFrame.bottomDetected,

    outerDetected:
      rightFrame.outerDetected,

    innerDetected:
      rightFrame.innerDetected,

    averageCandidateRatio:
      rightFrame.averageCandidateRatio,

    averageEdgeRatio:
      rightFrame.averageEdgeRatio,

    averageContinuity:
      rightFrame.averageContinuity
  },

  bridge: {
    detected:
      bridge.detected,

    score:
      bridge.score,

    candidateRatio:
      bridge.candidateRatio,

    edgeRatio:
      bridge.edgeRatio,

    continuity:
      bridge.continuity
  }
});

const bilateralFrames =
  leftFrame.frameDetected &&
  rightFrame.frameDetected;

const candidateBalance =
  Math.min(
    leftFrame.averageCandidateRatio,
    rightFrame.averageCandidateRatio
  ) /
  Math.max(
    leftFrame.averageCandidateRatio,
    rightFrame.averageCandidateRatio,
    0.0001
  );

const edgeBalance =
  Math.min(
    leftFrame.averageEdgeRatio,
    rightFrame.averageEdgeRatio
  ) /
  Math.max(
    leftFrame.averageEdgeRatio,
    rightFrame.averageEdgeRatio,
    0.0001
  );

const balancedBilateralPattern =
  candidateBalance >= 0.50 &&
  edgeBalance >= 0.50;

/*
 * 양쪽 프레임이 모두 검출되고,
 * 콧등 브리지까지 검출될 때 안경으로 판정한다.
 */
const bilateralWithBridge =
  bilateralFrames &&
  bridge.detected &&
  leftFrame.outerDetected &&
  rightFrame.outerDetected;
/*
 * 얇은 금속테 보조 판정
 * 브리지는 확실하고
 * 양쪽 점수가 모두 어느 정도 이상이면 인정.
 */
const thinMetalFrame =
  leftFrame.detectedSegments >= 2 &&
  rightFrame.detectedSegments >= 2 &&
  balancedBilateralPattern &&
  leftFrame.score > 0.45 &&
  rightFrame.score > 0.45 &&
  bridge.detected &&
leftFrame.outerDetected &&
rightFrame.outerDetected;

/*
 * 일반적인 두꺼운 안경
 */
const strongSymmetricPattern =
  leftFrame.detectedSegments >= 3 &&
  rightFrame.detectedSegments >= 3 &&
  balancedBilateralPattern &&
  leftFrame.score > 0.52 &&
  rightFrame.score > 0.52 &&
  bridge.score > 0.30 &&
  leftFrame.outerDetected &&
  rightFrame.outerDetected;

console.log({
  bilateralWithBridge,
  thinMetalFrame,
  strongSymmetricPattern,
  candidateBalance,
  edgeBalance,
  balancedBilateralPattern
});

const glassesDetected =
  bilateralWithBridge ||
  strongSymmetricPattern;

 console.log("GLASSES RULES", {
  bilateralWithBridge,
  thinMetalFrame,
  strongSymmetricPattern,
});   

  const confidence =
    glassesClamp(
      leftFrame.score *
        0.38 +
      rightFrame.score *
        0.38 +
      bridge.score *
        0.24,
      0,
      1
    );

  const templeEvidence =
    leftFrame.outerDetected && rightFrame.outerDetected;
  const frameEvidence =
    bilateralFrames || thinMetalFrame || strongSymmetricPattern;
  const bridgeEvidence = bridge.detected || bridge.score > 0.30;
  const reflectionEvidence =
    leftFrame.averageEdgeRatio > 0.18 &&
    rightFrame.averageEdgeRatio > 0.18 &&
    edgeBalance >= 0.45;

  const evidenceCount = [
    templeEvidence,
    frameEvidence,
    bridgeEvidence,
    reflectionEvidence
  ].filter(Boolean).length;
  const bilateralLowContrastFrame =
    leftFrame.detectedSegments >= 1 &&
    rightFrame.detectedSegments >= 1 &&
    candidateBalance >= 0.30 &&
    edgeBalance >= 0.30 &&
    bridge.score >= 0.12;
  /*
   * 실제 업로드 샘플에서 얇고 밝은 금속테는 frameDetected/outerDetected가
   * false여도 양쪽 눈에서 2개 이상의 연속 구간과 강한 브리지 점수가
   * 반복해서 나타났다. 이 조합은 PASS시키지 않고 안전하게 REVIEW로 보낸다.
   */
  
  const bilateralEyewearSignature =
  leftFrame.detectedSegments >= 2 &&
  rightFrame.detectedSegments >= 2 &&
  leftFrame.score >= 0.45 &&
  rightFrame.score >= 0.45 &&
  bridge.score >= 0.40 &&
  confidence >= 0.45 &&
  (
    bridge.detected ||
    templeEvidence ||
    reflectionEvidence ||
    (
      leftFrame.outerDetected &&
      rightFrame.outerDetected
    )
  );

  const subtleBilateralEyewearSignature =
  leftFrame.score >= 0.35 &&
  rightFrame.score >= 0.35 &&
  confidence >= 0.40 &&
  bridge.score >= 0.32 &&
  (
    bridge.detected ||
    reflectionEvidence
  );

  const bridgeCorroborated =
  bridge.detected ||
  (
    bridge.score >= 0.45 &&
    leftFrame.outerDetected &&
    rightFrame.outerDetected &&
    confidence >= 0.45
  );
  
  const bridgeIndependentEvidence =
    templeEvidence && reflectionEvidence && frameEvidence;

  const needsEyewearReview = glassesDetected;

    console.log("EYEWEAR REVIEW DEBUG", {
  glassesDetected,
  needsEyewearReview,
  evidenceCount,
  templeEvidence,
  frameEvidence,
  bridgeEvidence,
  reflectionEvidence,
  bilateralLowContrastFrame,
  bilateralEyewearSignature,
  subtleBilateralEyewearSignature,
  bridgeCorroborated,
  bridgeIndependentEvidence,
  bridgeDetected: bridge.detected,
  bridgeScore: Number(bridge.score.toFixed(3)),
  confidence: Number(confidence.toFixed(3)),
  candidateBalance: Number(candidateBalance.toFixed(3)),
  edgeBalance: Number(edgeBalance.toFixed(3)),
  leftOuterDetected: leftFrame.outerDetected,
  rightOuterDetected: rightFrame.outerDetected
});

  const verdict = glassesDetected || needsEyewearReview
    ? 'REVIEW'
    : 'PASS';

  const result = {
    glassesDetected: verdict !== 'PASS',
    verdict,
    confidence,
    evidenceCount,
    evidence: {
      temple: templeEvidence,
      bridge: bridgeEvidence,
      frame: frameEvidence,
      reflection: reflectionEvidence,
      lowContrastBilateralFrame: bilateralLowContrastFrame,
      bilateralEyewearSignature,
      subtleBilateralEyewearSignature,
      bridgeCorroborated,
      bridgeIndependentEvidence,
      bilateralBalance: Number(Math.min(candidateBalance, edgeBalance).toFixed(3))
    },

    leftEyeScore:
      leftFrame.score,

    rightEyeScore:
      rightFrame.score,

    bridgeScore:
      bridge.score,

    leftSegments:
      leftFrame.detectedSegments,

    rightSegments:
      rightFrame.detectedSegments,

    bridgeDetected:
      bridge.detected,

    skinReference: {
      r: Math.round(
        skinColor.r
      ),

      g: Math.round(
        skinColor.g
      ),

      b: Math.round(
        skinColor.b
      )
    }
  };

  console.log(
    '========== GLASSES DEBUG =========='
  );

  console.table({
    glassesDetected:
      result.glassesDetected,

    confidence:
      Number(
        result.confidence.toFixed(3)
      ),

    leftEyeScore:
      Number(
        result.leftEyeScore.toFixed(3)
      ),

    rightEyeScore:
      Number(
        result.rightEyeScore.toFixed(3)
      ),

    bridgeScore:
      Number(
        result.bridgeScore.toFixed(3)
      ),

    leftSegments:
      result.leftSegments,

    rightSegments:
      result.rightSegments,

    bridgeDetected:
      result.bridgeDetected,

    skinR:
      result.skinReference.r,

    skinG:
      result.skinReference.g,

    skinB:
      result.skinReference.b
  });

  return result;
}
  window.detectGlassesValidation =
  detectGlassesValidation;
`;
