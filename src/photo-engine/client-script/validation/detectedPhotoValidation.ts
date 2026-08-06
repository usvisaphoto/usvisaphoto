export const detectedPhotoValidationScript = String.raw`
function evaluateDetectedPhoto(lm, iw, ih, sourceImage) {
  const eyeResult = detectEyes(lm);
  const mouthResult = detectMouth(
  lm,
  sourceImage,
  iw,
  ih
);
  const headMetrics = getHeadMetrics(lm, iw, ih);
  const faceDirection = detectFaceDirection(lm);
  const appearance =  validateAppearance(sourceImage, lm, iw, ih);

  const foreheadY = headMetrics.foreheadY;
  const chinY = headMetrics.chinY;
  const faceHeight = headMetrics.faceHeight;
  const eyebrowTopY = Math.min(
    lm[70].y * ih,
    lm[300].y * ih,
    lm[105].y * ih,
    lm[334].y * ih
  );

  const chinToEyebrow = chinY - eyebrowTopY;
  const estimatedCrownY = Math.max(
    0,
    eyebrowTopY - chinToEyebrow * 0.42
  );
  /*
 * 사진 제작 전용 정수리 추정값.
 *
 * 기존 0.42 계산값에 레이아웃 단계에서 0.875를 다시 곱하던
 * 이중 보정을 하나의 정수리 좌표 계산으로 통합한다.
 *
 * (1 + 0.42) / 0.875 - 1 ≈ 0.623
 */
const layoutCrownY = Math.max(
  0,
  eyebrowTopY - chinToEyebrow * 0.623
);

  const crownToChinRatio = headMetrics.crownToChinRatio;
  const bottomSpaceRatio = headMetrics.bottomSpaceRatio;
  const headHeightPx = Math.max(1, chinY - estimatedCrownY);
  const lowerBodyRoomRatio = (ih - chinY) / headHeightPx;
  const shoulderRoomRatio = bottomSpaceRatio;

 const headTooLargeForSource = crownToChinRatio > 0.72;
const upperBodyTooClose = lowerBodyRoomRatio < 0.30;
const shouldersLikelyCropped = shoulderRoomRatio < 0.16;

const upperBodyHardFail =
  shouldersLikelyCropped ||
  (headTooLargeForSource && upperBodyTooClose);


  const yawRatio = faceDirection.yawRatio;
  const faceNotStraight = faceDirection.faceNotStraight;
  const sideFace = yawRatio < 0.72;

  const foreheadToTopRatio = estimatedCrownY / ih;
  const eyebrowToCrownRatio =
    Math.abs(eyebrowTopY - estimatedCrownY) / Math.max(1, faceHeight);

  const capBrimLikely =
    Math.abs(lm[10].y - lm[151].y) < 0.018 ||
    Math.abs(lm[9].y - lm[10].y) < 0.018;

  const hatLikelyDetected =
    capBrimLikely &&
    foreheadToTopRatio < 0.08 &&
    crownToChinRatio > 0.32;

  const faceLeftX = lm[234].x;
  const faceRightX = lm[454].x;
  const faceCenterX = (faceLeftX + faceRightX) / 2;
  const faceWidthRatio = Math.abs(faceRightX - faceLeftX);

  const faceCenteredOk =
    faceCenterX > 0.38 &&
    faceCenterX < 0.62;

  const faceWidthOk = faceWidthRatio < 0.48;
  const headSizeOk = crownToChinRatio <= 0.68;
  const bottomSpaceOk = bottomSpaceRatio >= 0.10;

  let validationScore = 100;

  if (!headSizeOk) validationScore -= 10;
  if (!faceCenteredOk) validationScore -= 15;
  if (!faceWidthOk) validationScore -= 12;
  if (!bottomSpaceOk) validationScore -= 8;
  if (upperBodyHardFail) validationScore -= 8;
  if (sideFace) validationScore -= 25;
  if (faceNotStraight) validationScore -= 25;
  if (hatLikelyDetected) validationScore -= 40;

  validationScore = Math.max(0, Math.min(100, validationScore));

  const directionHardFail =
    sideFace && faceNotStraight;

  const shoulderLikelyCropped =
  crownToChinRatio > 0.68 &&
  bottomSpaceRatio < 0.14;

const tightIdPhotoCrop =
  crownToChinRatio > 0.74 ||
  (
    crownToChinRatio > 0.68 &&
    bottomSpaceRatio < 0.16 &&
    lowerBodyRoomRatio < 0.28
  );

const compositionHardFail =
  tightIdPhotoCrop ||
  shoulderLikelyCropped;

const alreadyCropped =
  compositionHardFail ||
  shouldersLikelyCropped ||
  upperBodyHardFail;
  
  let score = validationScore;

  if (window.usvisaPhotoDateWarning) {
    score = Math.min(score, 98);
  }

  score = Math.max(80, Math.min(100, score));

const glassesDetected =
  Boolean(
    appearance &&
    appearance.glasses &&
    appearance.glasses.glassesDetected
  );
const glassesReview = Boolean(
  appearance &&
  appearance.glasses &&
  appearance.glasses.verdict === 'REVIEW'
);

const teethVisible =
  Boolean(
    mouthResult &&
    mouthResult.teethVisible
  );

let failureReason = null;

if (glassesDetected) {
  failureReason =
    'glassesReview';
} else if (glassesReview) {
  failureReason =
    'glassesReview';
} else if (
  teethVisible ||
  mouthResult.mouthOpened
) {
  failureReason =
    'mouthOpen';
} else if (eyeResult.eyesClosed) {
  failureReason =
    'eyesClosed';
} else if (hatLikelyDetected) {
  failureReason =
    'hat';
} else if (
  faceNotStraight ||
  sideFace
) {
  failureReason =
    'direction';
} else if (upperBodyHardFail) {
  failureReason =
    'upperBodyTight';
} else if (alreadyCropped) {
  failureReason =
    'professionalRecoverable';
}

  console.log({
    crownToChinRatio,
    lowerBodyRoomRatio,
    shoulderRoomRatio,
    headTooLargeForSource,
    upperBodyTooClose,
    shouldersLikelyCropped
  });

  console.log("========== PHOTO DEBUG ==========");

  console.table({
  validationScore,
  failureReason,

  headSizeOk,
  bottomSpaceOk,

  glassesDetected,
  teethVisible,
  mouthOpened:
    mouthResult.mouthOpened,

  upperBodyTooTight:
    upperBodyHardFail,

  sideFace,
  faceNotStraight,
  hatLikelyDetected,
  alreadyCropped,

  crownToChinRatio,
  bottomSpaceRatio,
  lowerBodyRoomRatio,
  shoulderRoomRatio,

  headTooLargeForSource,
  upperBodyTooClose,
  shouldersLikelyCropped
});

  return {
    pass: !failureReason,
    failureReason,
    appearance,
    eyeResult,
    mouthResult,
    estimatedCrownY,
    layoutCrownY,
    detectedChinY: chinY,
    foreheadY,
    faceHeight,
    score,
    report: {
      headSizeText: 'Head size within accepted range',
      centerText: 'Face centered and forward-facing',
      originalText: 'Original photo check passed',
      metrics: {
        crownToChinRatio: crownToChinRatio,
        bottomSpaceRatio: bottomSpaceRatio,
        yawRatio: yawRatio
      }
    }
  };
}
`;
