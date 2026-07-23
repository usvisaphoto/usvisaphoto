export const detectedPhotoValidationScript = String.raw`
function evaluateDetectedPhoto(lm, iw, ih) {
  const eyeResult = detectEyes(lm);
  const mouthResult = detectMouth(lm);
  const headMetrics = getHeadMetrics(lm, iw, ih);
  const faceDirection = detectFaceDirection(lm);

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

  const crownToChinRatio = headMetrics.crownToChinRatio;
  const bottomSpaceRatio = headMetrics.bottomSpaceRatio;
  const headHeightPx = Math.max(1, chinY - estimatedCrownY);
  const lowerBodyRoomRatio = (ih - chinY) / headHeightPx;
  const shoulderRoomRatio = bottomSpaceRatio;

  const headTooLargeForSource = crownToChinRatio > 0.52;
  const upperBodyTooClose = lowerBodyRoomRatio < 1.15;
  const shouldersLikelyCropped = shoulderRoomRatio < 0.30;

  const upperBodyHardFail =
    headTooLargeForSource ||
    shouldersLikelyCropped ||
    (upperBodyTooClose && shoulderRoomRatio < 0.38);

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
    crownToChinRatio > 0.46 &&
    bottomSpaceRatio < 0.34 &&
    validationScore < 90;

  const tightIdPhotoCrop =
    (crownToChinRatio > 0.52 && bottomSpaceRatio < 0.24) ||
    (crownToChinRatio > 0.62 && bottomSpaceRatio < 0.32) ||
    crownToChinRatio > 0.70;

  const compositionHardFail =
    tightIdPhotoCrop || shoulderLikelyCropped;

  const alreadyCropped =
    hatLikelyDetected ||
    directionHardFail ||
    compositionHardFail ||
    shouldersLikelyCropped ||
    upperBodyHardFail;

  let score = validationScore;

  if (window.usvisaPhotoDateWarning) {
    score = Math.min(score, 98);
  }

  score = Math.max(80, Math.min(100, score));

  let failureReason = null;

  if (eyeResult.eyesClosed) {
    failureReason = 'eyesClosed';
  } else if (mouthResult.mouthOpened) {
    failureReason = 'mouthOpen';
  } else if (hatLikelyDetected) {
    failureReason = 'hat';
  } else if (faceNotStraight || sideFace) {
    failureReason = 'direction';
  } else if (upperBodyHardFail) {
    failureReason = 'upperBodyTight';
  } else if (alreadyCropped) {
    failureReason = 'alreadyCropped';
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
    headSizeOk,
    bottomSpaceOk,
    upperBodyTooTight: upperBodyHardFail,
    sideFace,
    faceNotStraight,
    hatLikelyDetected,
    alreadyCropped,
    crownToChinRatio,
    bottomSpaceRatio
  });

  return {
    pass: !failureReason,
    failureReason,
    eyeResult,
    mouthResult,
    estimatedCrownY,
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
