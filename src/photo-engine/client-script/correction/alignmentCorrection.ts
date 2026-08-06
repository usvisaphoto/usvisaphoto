export const alignmentCorrectionScript = String.raw`
const BASIC_ALIGNMENT_MAX_DEGREES = 3.0;
const BASIC_ALIGNMENT_DISAGREEMENT_DEGREES = 2.25;
const BASIC_ALIGNMENT_MIN_SHOULDER_VISIBILITY = 0.35;

function radiansToDegrees(value) {
  return value * (180 / Math.PI);
}

function degreesToRadians(value) {
  return value * (Math.PI / 180);
}

function normalizeSmallAngleRadians(value) {
  if (!Number.isFinite(value)) return 0;

  let normalized = value;

  while (normalized > Math.PI / 2) normalized -= Math.PI;
  while (normalized < -Math.PI / 2) normalized += Math.PI;

  return normalized;
}

function getShoulderAlignmentMeasurement(poseResults) {
  if (
    !poseResults ||
    !poseResults.poseLandmarks ||
    poseResults.poseLandmarks.length < 13
  ) {
    return null;
  }

  const leftShoulder = poseResults.poseLandmarks[11];
  const rightShoulder = poseResults.poseLandmarks[12];

  if (
    !leftShoulder ||
    !rightShoulder ||
    !Number.isFinite(leftShoulder.x) ||
    !Number.isFinite(leftShoulder.y) ||
    !Number.isFinite(rightShoulder.x) ||
    !Number.isFinite(rightShoulder.y)
  ) {
    return null;
  }

  const leftVisibility =
    typeof leftShoulder.visibility === 'number'
      ? leftShoulder.visibility
      : 0;

  const rightVisibility =
    typeof rightShoulder.visibility === 'number'
      ? rightShoulder.visibility
      : 0;

  const shoulderWidth = Math.abs(
    rightShoulder.x - leftShoulder.x
  );

  const reliable =
    leftVisibility >= BASIC_ALIGNMENT_MIN_SHOULDER_VISIBILITY &&
    rightVisibility >= BASIC_ALIGNMENT_MIN_SHOULDER_VISIBILITY &&
    shoulderWidth >= 0.10 &&
    shoulderWidth <= 0.82;

  const angle = normalizeSmallAngleRadians(
    Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    )
  );

  return {
    angle,
    angleDegrees: radiansToDegrees(angle),
    leftVisibility,
    rightVisibility,
    shoulderWidth,
    reliable,
  };
}

function calculateBasicAlignmentCorrection(options) {
  const eyeAngle = normalizeSmallAngleRadians(
    Number(options && options.eyeAngle)
  );

  const shoulderMeasurement =
    options && options.shoulderMeasurement
      ? options.shoulderMeasurement
      : null;

  const maxAngle = degreesToRadians(
    BASIC_ALIGNMENT_MAX_DEGREES
  );

  const maxDisagreement = degreesToRadians(
    BASIC_ALIGNMENT_DISAGREEMENT_DEGREES
  );

  const eyeUsable = Math.abs(eyeAngle) <= maxAngle;
  const shoulderUsable = Boolean(
    shoulderMeasurement &&
    shoulderMeasurement.reliable &&
    Number.isFinite(shoulderMeasurement.angle) &&
    Math.abs(shoulderMeasurement.angle) <= maxAngle
  );

  let correctionAngle = 0;
  let source = 'none';
  let reason = 'NO_SAFE_ALIGNMENT';

  if (eyeUsable && shoulderUsable) {
    const disagreement = Math.abs(
      eyeAngle - shoulderMeasurement.angle
    );

    if (disagreement <= maxDisagreement) {
      /*
       * 눈과 어깨가 같은 방향으로 기울어진 경우에만
       * 사진 전체가 기울어진 것으로 판단한다.
       * 어깨값에 조금 더 높은 가중치를 둔다.
       */
      correctionAngle =
        eyeAngle * 0.40 +
        shoulderMeasurement.angle * 0.60;
      source = 'eyes-and-shoulders';
      reason = 'CONSISTENT_GLOBAL_TILT';
    } else {
      /*
       * 눈과 어깨 기울기가 크게 다르면
       * 실제 고개 기울기일 수 있으므로 자동 회전하지 않는다.
       */
      reason = 'HEAD_AND_SHOULDERS_DISAGREE';
    }
  } else if (shoulderUsable) {
    correctionAngle = shoulderMeasurement.angle;
    source = 'shoulders';
    reason = 'SHOULDER_LEVEL_ONLY';
  } else if (eyeUsable && Math.abs(eyeAngle) <= degreesToRadians(1.5)) {
    /*
     * Pose가 불안정할 때는 눈 기울기가 아주 작은 경우에만
     * 제한적으로 사진 전체 회전을 허용한다.
     */
    correctionAngle = eyeAngle;
    source = 'eyes-fallback';
    reason = 'SMALL_EYE_LEVEL_FALLBACK';
  }

  correctionAngle = Math.max(
    -maxAngle,
    Math.min(maxAngle, correctionAngle)
  );

  return {
    angle: correctionAngle,
    angleDegrees: radiansToDegrees(correctionAngle),
    source,
    reason,
    eyeAngle,
    eyeAngleDegrees: radiansToDegrees(eyeAngle),
    shoulderAngle:
      shoulderMeasurement && Number.isFinite(shoulderMeasurement.angle)
        ? shoulderMeasurement.angle
        : null,
    shoulderAngleDegrees:
      shoulderMeasurement && Number.isFinite(shoulderMeasurement.angle)
        ? radiansToDegrees(shoulderMeasurement.angle)
        : null,
  };
}

function resolveLockedAlignmentAngle(lockedDetection) {
  if (!lockedDetection) return 0;

  if (
    lockedDetection.alignment &&
    Number.isFinite(Number(lockedDetection.alignment.angle))
  ) {
    return Number(lockedDetection.alignment.angle);
  }

  /*
   * 이전 버전에서 저장된 Auto Detect 결과와의 호환성.
   * 예전 데이터는 faceTiltAngle만 있으므로 과도한 회전을 막기 위해
   * 1.5도 이하에서만 fallback으로 사용한다.
   */
  const legacyEyeAngle = Number(lockedDetection.faceTiltAngle);
  const legacyLimit = degreesToRadians(1.5);

  if (
    Number.isFinite(legacyEyeAngle) &&
    Math.abs(legacyEyeAngle) <= legacyLimit
  ) {
    return legacyEyeAngle;
  }

  return 0;
}
`;
