export const poseValidationScript = String.raw`
let poseDetector = null;

async function initPoseDetector() {
  if (poseDetector) return poseDetector;

  poseDetector = new Pose({
    locateFile: function(file) {
      return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file;
    }
  });

  poseDetector.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.3,
    minTrackingConfidence: 0.3
  });

  return poseDetector;
}

function getPoseVisibility(point) {
  return point && typeof point.visibility === 'number'
    ? point.visibility
    : 0;
}

function validatePoseComposition(results) {
  /*
   * Pose 검사의 역할:
   * - 양쪽 어깨가 확인되는지
   * - 어깨가 좌우 프레임에 잘렸는지
   * - 자동 제작이 어려울 정도로 지나치게 타이트한 크롭인지
   *
   * 팔꿈치와 골반은 필수 조건으로 사용하지 않음.
   */

  if (
    !results ||
    !results.poseLandmarks ||
    results.poseLandmarks.length < 13
  ) {
    return {
      pass: false,
      reason: 'UPPER_BODY_NOT_DETECTED',
      message:
        'Both shoulders could not be verified. Please upload a clearer photo showing both shoulders.'
    };
  }

  const lm = results.poseLandmarks;

  const leftShoulder = lm[11];
  const rightShoulder = lm[12];

  const leftVisibility = getPoseVisibility(leftShoulder);
  const rightVisibility = getPoseVisibility(rightShoulder);

  /*
   * 멀리서 촬영된 정상사진도 허용하기 위해
   * visibility 기준을 지나치게 높이지 않음.
   */
  const shouldersVisible =
    leftVisibility >= 0.20 &&
    rightVisibility >= 0.20;

  const shoulderWidth =
    Math.abs(leftShoulder.x - rightShoulder.x);

  /*
   * 지나치게 좁으면 한쪽 어깨가 가려졌거나
   * Pose 오검출 가능성이 있음.
   */
  const shoulderWidthTooNarrow =
  shoulderWidth < 0.07;

  
  /*
   * 지나치게 넓으면 사진이 어깨 주변에서
   * 너무 타이트하게 크롭되었을 가능성이 있음.
   */
  const shoulderWidthTooWide =
    shoulderWidth > 0.82;

  /*
   * 어깨 좌표가 이미지 좌우 끝에 닿았는지 확인.
   * 정상 스튜디오 사진에서 어깨가 넓게 보여도
   * 실제 프레임 안에 있으면 허용.
   */
  const leftShoulderCropped =
    leftShoulder.x <= 0.015;

  const rightShoulderCropped =
    rightShoulder.x >= 0.985;

  const shouldersTouchFrame =
    leftShoulderCropped ||
    rightShoulderCropped;

  const averageShoulderY =
    (leftShoulder.y + rightShoulder.y) / 2;

  /*
   * 어깨가 사진 최하단에 거의 붙은 경우만 거절.
   * 전신사진과 여백이 많은 사진은 정상 허용.
   */
  const shouldersTooLow =
    averageShoulderY >= 0.96;

  /*
   * 잘못된 Pose 좌표 방어.
   */
  const invalidShoulderCoordinates =
    !Number.isFinite(leftShoulder.x) ||
    !Number.isFinite(leftShoulder.y) ||
    !Number.isFinite(rightShoulder.x) ||
    !Number.isFinite(rightShoulder.y);

  let pass = true;
  let reason = 'POSE_OK';
  let message =
    'Both shoulders are visible and the source photo has sufficient composition.';

  if (invalidShoulderCoordinates) {
    pass = false;
    reason = 'INVALID_POSE_RESULT';
    message =
      'The upper-body position could not be verified.';
  } else if (!shouldersVisible) {
    pass = false;
    reason = 'SHOULDERS_NOT_VISIBLE';
    message =
      'Both shoulders must be clearly visible.';
  } else if (shouldersTouchFrame) {
    pass = false;
    reason = 'SHOULDERS_CROPPED';
    message =
      'One or both shoulders are cropped by the image edges.';
  } else if (shoulderWidthTooNarrow) {
    pass = false;
    reason = 'SHOULDERS_NOT_VERIFIED';
    message =
      'Both shoulders could not be verified clearly.';
  } else if (shoulderWidthTooWide) {
    pass = false;
    reason = 'PHOTO_CROPPED_TOO_TIGHTLY';
    message =
      'The photo is cropped too tightly around the shoulders.';
  } else if (shouldersTooLow) {
    pass = false;
    reason = 'INSUFFICIENT_SPACE_BELOW_SHOULDERS';
    message =
      'More space is required below the shoulders.';
  }

  console.log('========== POSE COMPOSITION DEBUG ==========');
  console.log({
    leftShoulder,
    rightShoulder,
    leftVisibility,
    rightVisibility,
    shouldersVisible,
    shoulderWidth,
    shoulderWidthTooNarrow,
    shoulderWidthTooWide,
    shouldersTouchFrame,
    averageShoulderY,
    shouldersTooLow,
    reason,
    message,
    pass
  });

  return {
    pass,
    reason,
    message,
    shouldersVisible,
    shoulderWidth,
    shoulderWidthTooNarrow,
    shoulderWidthTooWide,
    shouldersTouchFrame,
    averageShoulderY,
    shouldersTooLow
  };
}
`;

