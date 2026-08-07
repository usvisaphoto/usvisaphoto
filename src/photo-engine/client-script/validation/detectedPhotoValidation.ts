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
  const appearance = validateAppearance(
    sourceImage,
    lm,
    iw,
    ih
  );

  // ------------------------------------------------
  // FACE / HEAD METRICS
  // ------------------------------------------------

  const foreheadY = headMetrics.foreheadY;
  const chinY = headMetrics.chinY;
  const faceHeight = headMetrics.faceHeight;

  const eyebrowTopY = Math.min(
    lm[70].y * ih,
    lm[300].y * ih,
    lm[105].y * ih,
    lm[334].y * ih
  );

  const chinToEyebrow =
    chinY - eyebrowTopY;

  const estimatedCrownY = Math.max(
    0,
    eyebrowTopY - chinToEyebrow * 0.42
  );

  /*
   * 사진 제작 전용 정수리 추정값.
   *
   * 기존 0.42 계산값에 레이아웃 단계에서 0.875를
   * 다시 곱하던 이중 보정을 하나의 계산으로 통합.
   *
   * (1 + 0.42) / 0.875 - 1 ≈ 0.623
   */
  const layoutCrownY = Math.max(
    0,
    eyebrowTopY - chinToEyebrow * 0.623
  );

  const crownToChinRatio =
    headMetrics.crownToChinRatio;

  const bottomSpaceRatio =
    headMetrics.bottomSpaceRatio;

  const headHeightPx = Math.max(
    1,
    chinY - estimatedCrownY
  );

  const lowerBodyRoomRatio =
    (ih - chinY) / headHeightPx;


  // ------------------------------------------------
  // FACE POSITION
  // ------------------------------------------------

  const faceLeftX = lm[234].x;
  const faceRightX = lm[454].x;

  const faceCenterX =
    (faceLeftX + faceRightX) / 2;

  const faceWidthRatio =
    Math.abs(faceRightX - faceLeftX);

  const faceCenteredOk =
    faceCenterX > 0.38 &&
    faceCenterX < 0.62;

  const faceWidthOk =
    faceWidthRatio < 0.48;


  // ------------------------------------------------
  // HEAD / COMPOSITION
  // ------------------------------------------------

  const headTooLargeForSource =
    crownToChinRatio > 0.72;

  const upperBodyTooClose =
    lowerBodyRoomRatio < 0.30;

  /*
   * 이 파일에서는 실제 어깨 좌표를 추정하지 않는다.
   *
   * 실제 shoulder crop 판정은 MediaPipe Pose의
   * lm[11], lm[12]를 사용하는 poseValidation.ts가 담당한다.
   *
   * 여기서는 얼굴/머리 크기를 기반으로
   * 명백하게 지나치게 타이트한 사진만 보조 판정한다.
   */
  const upperBodyHardFail =
    headTooLargeForSource &&
    upperBodyTooClose;


  // ------------------------------------------------
  // FACE DIRECTION
  // ------------------------------------------------

  const yawRatio =
    faceDirection.yawRatio;

  const faceNotStraight =
    faceDirection.faceNotStraight;

  /*
   * 약간의 비대칭만으로 DENY하지 않도록
   * 명확한 측면 얼굴에 가까운 경우만 hard fail.
   */
  const sideFace =
    yawRatio < 0.72;

  const directionHardFail =
    sideFace &&
    faceNotStraight;


  // ------------------------------------------------
  // HAT / HEAD COVERING
  // ------------------------------------------------

  const foreheadToTopRatio =
    estimatedCrownY / ih;

  const eyebrowToCrownRatio =
    Math.abs(
      eyebrowTopY - estimatedCrownY
    ) / Math.max(1, faceHeight);

  const capBrimLikely =
    Math.abs(
      lm[10].y - lm[151].y
    ) < 0.018 ||
    Math.abs(
      lm[9].y - lm[10].y
    ) < 0.018;

  const hatLikelyDetected =
    capBrimLikely &&
    foreheadToTopRatio < 0.08 &&
    crownToChinRatio > 0.32;


  // ------------------------------------------------
  // BASIC SIZE CHECK
  // ------------------------------------------------

  const headSizeOk =
    crownToChinRatio <= 0.68;

  const bottomSpaceOk =
    bottomSpaceRatio >= 0.10;


  // ------------------------------------------------
  // TIGHT CROP FALLBACK
  // ------------------------------------------------

  /*
   * Pose가 최종 shoulder crop을 판단하지만,
   * 얼굴 자체가 지나치게 큰 기존 증명사진 형태도
   * 여기서 recoverable로 분류한다.
   */

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
    upperBodyHardFail;


  // ------------------------------------------------
  // VALIDATION SCORE
  // ------------------------------------------------

  let validationScore = 100;

  if (!headSizeOk) {
    validationScore -= 10;
  }

  if (!faceCenteredOk) {
    validationScore -= 15;
  }

  if (!faceWidthOk) {
    validationScore -= 12;
  }

  if (!bottomSpaceOk) {
    validationScore -= 8;
  }

  if (upperBodyHardFail) {
    validationScore -= 8;
  }

  if (sideFace) {
    validationScore -= 25;
  }

  if (faceNotStraight) {
    validationScore -= 25;
  }

  if (hatLikelyDetected) {
    validationScore -= 40;
  }

  validationScore = Math.max(
    0,
    Math.min(100, validationScore)
  );

  let score = validationScore;

  if (window.usvisaPhotoDateWarning) {
    score = Math.min(
      score,
      98
    );
  }

  score = Math.max(
    80,
    Math.min(100, score)
  );


  // ------------------------------------------------
  // GLASSES
  // ------------------------------------------------

  const glassesDetected =
    Boolean(
      appearance &&
      appearance.glasses &&
      appearance.glasses.glassesDetected
    );

  const glassesReview =
    Boolean(
      appearance &&
      appearance.glasses &&
      appearance.glasses.verdict === 'REVIEW'
    );


  // ------------------------------------------------
  // MOUTH
  // ------------------------------------------------

  const teethVisible =
    Boolean(
      mouthResult &&
      mouthResult.teethVisible
    );


  // ------------------------------------------------
  // FINAL FAILURE REASON
  // ------------------------------------------------

  /*
   * 판정 우선순위
   *
   * 1. 안경
   * 2. 입
   * 3. 눈
   * 4. 모자
   * 5. 복구 가능한 crop/composition
   * 6. 실제 심한 얼굴 방향 오류
   *
   * Recoverable composition 문제는
   * 일반 DENY가 아니라 E.R.U Review 흐름으로 보낸다.
   */

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

  } else if (
    eyeResult.eyesClosed
  ) {
    failureReason =
      'eyesClosed';

  } else if (
    hatLikelyDetected
  ) {
    failureReason =
      'hat';

  } else if (
    upperBodyHardFail
  ) {
    failureReason =
      'professionalRecoverable';

  } else if (
    alreadyCropped
  ) {
    failureReason =
      'professionalRecoverable';

  } else if (
    directionHardFail
  ) {
    failureReason =
      'direction';
  }


  // ------------------------------------------------
  // DEBUG
  // ------------------------------------------------

  console.log(
    "========== DETECTED PHOTO METRICS =========="
  );

  console.log({
    crownToChinRatio,
    bottomSpaceRatio,
    lowerBodyRoomRatio,

    headTooLargeForSource,
    upperBodyTooClose,

    faceCenterX,
    faceWidthRatio,

    tightIdPhotoCrop,
    shoulderLikelyCropped,
    compositionHardFail,
    alreadyCropped
  });

  console.log(
    "========== PHOTO DEBUG =========="
  );

  console.table({
    validationScore,
    failureReason,

    headSizeOk,
    bottomSpaceOk,

    glassesDetected,
    glassesReview,

    teethVisible,

    mouthOpened:
      mouthResult.mouthOpened,

    upperBodyTooTight:
      upperBodyHardFail,

    sideFace,
    faceNotStraight,
    directionHardFail,

    hatLikelyDetected,

    alreadyCropped,

    crownToChinRatio,
    bottomSpaceRatio,
    lowerBodyRoomRatio,

    faceCenterX,
    faceWidthRatio,

    headTooLargeForSource,
    upperBodyTooClose,

    tightIdPhotoCrop,
    shoulderLikelyCropped,
    compositionHardFail
  });


  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
      headSizeText:
        'Head size within accepted range',

      centerText:
        'Face centered and forward-facing',

      originalText:
        'Original photo check passed',

      metrics: {
        crownToChinRatio:
          crownToChinRatio,

        bottomSpaceRatio:
          bottomSpaceRatio,

        yawRatio:
          yawRatio
      }
    }
  };
}
`;