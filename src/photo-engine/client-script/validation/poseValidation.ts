export const poseValidationScript = String.raw`
let poseDetector = null;

async function initPoseDetector() {
  if (poseDetector) {
    return poseDetector;
  }

  poseDetector = new Pose({
    locateFile: function(file) {
      return (
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' +
        file
      );
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
  return (
    point &&
    typeof point.visibility === 'number'
  )
    ? point.visibility
    : 0;
}


function validatePoseComposition(results) {
  /*
   * Pose 검사의 역할
   *
   * 1. 양쪽 어깨가 검출되는지
   * 2. 어깨가 좌우 프레임에서 잘렸는지
   * 3. 사진이 상체 주변에서 너무 타이트하게
   *    크롭되었는지
   * 4. 자동 Basic 제작이 가능한 구도인지
   *
   * 팔꿈치와 골반은 필수 조건으로 사용하지 않는다.
   *
   * 어깨/상체가 부족한 사진은 일반 DENY가 아니라
   * E.R.U에서 복구할 수 있는 composition 문제로 처리한다.
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
        'Both shoulders could not be verified. Embassy-Ready Upgrade is recommended.',
      recoverable: true
    };
  }


  const lm = results.poseLandmarks;

  const leftShoulder = lm[11];
  const rightShoulder = lm[12];


  // ------------------------------------------------
  // LANDMARK VALIDATION
  // ------------------------------------------------

  const invalidShoulderCoordinates =
    !leftShoulder ||
    !rightShoulder ||
    !Number.isFinite(leftShoulder.x) ||
    !Number.isFinite(leftShoulder.y) ||
    !Number.isFinite(rightShoulder.x) ||
    !Number.isFinite(rightShoulder.y);

  if (invalidShoulderCoordinates) {
    return {
      pass: false,
      reason: 'INVALID_POSE_RESULT',
      message:
        'The upper-body position could not be verified.',
      recoverable: true
    };
  }


  // ------------------------------------------------
  // VISIBILITY
  // ------------------------------------------------

  const leftVisibility =
    getPoseVisibility(leftShoulder);

  const rightVisibility =
    getPoseVisibility(rightShoulder);

  /*
   * 멀리 촬영된 정상 사진까지 거절하지 않도록
   * visibility 기준은 낮게 유지한다.
   */
  const shouldersVisible =
    leftVisibility >= 0.20 &&
    rightVisibility >= 0.20;


  // ------------------------------------------------
  // SHOULDER GEOMETRY
  // ------------------------------------------------

  /*
   * MediaPipe에서 11, 12는 실제 옷의 어깨 끝이 아니라
   * 어깨 관절 중심에 가까운 위치다.
   *
   * 따라서 관절점이 이미지 끝에 닿았는지만 검사하면
   * 실제 어깨가 잘린 사진을 놓치게 된다.
   */

  const shoulderMinX =
    Math.min(
      leftShoulder.x,
      rightShoulder.x
    );

  const shoulderMaxX =
    Math.max(
      leftShoulder.x,
      rightShoulder.x
    );

  const shoulderWidth =
    shoulderMaxX - shoulderMinX;

  const leftShoulderRoom =
    shoulderMinX;

  const rightShoulderRoom =
    1 - shoulderMaxX;

  const minShoulderSideRoom =
    Math.min(
      leftShoulderRoom,
      rightShoulderRoom
    );


  /*
   * 현재 관절 폭에 비해 좌우 여백이 얼마나 남았는지 계산.
   *
   * 절대 좌표 하나만 보는 것보다
   * 체격과 촬영 거리에 대응하기 쉽다.
   */
  const sideRoomToShoulderRatio =
    minShoulderSideRoom /
    Math.max(shoulderWidth, 0.001);


  // ------------------------------------------------
  // ESTIMATED OUTER SHOULDER
  // ------------------------------------------------

  /*
   * Pose shoulder landmark는 실제 어깨 끝보다 안쪽에 있다.
   *
   * 관절 간 폭의 약 55%를 양쪽 바깥으로 연장하여
   * 실제 상체/어깨 외곽 위치를 보수적으로 추정한다.
   */

  const estimatedOuterExtension =
    shoulderWidth * 0.55;

  const estimatedLeftOuterShoulder =
    shoulderMinX -
    estimatedOuterExtension;

  const estimatedRightOuterShoulder =
    shoulderMaxX +
    estimatedOuterExtension;


  // ------------------------------------------------
  // CROP DETECTION
  // ------------------------------------------------

  /*
   * 1. 관절 자체가 프레임에 매우 가까운 경우
   */
  const shoulderJointNearFrame =
    shoulderMinX <= 0.055 ||
    shoulderMaxX >= 0.945;


  /*
   * 2. 추정한 실제 어깨 끝이 이미지 밖으로 나가는 경우
   */
  const estimatedShoulderOutsideFrame =
    estimatedLeftOuterShoulder <= 0.015 ||
    estimatedRightOuterShoulder >= 0.985;


  /*
   * 3. 어깨 폭과 비교했을 때 좌우 공간이 부족한 경우
   *
   * 이 조건이 지금 문제의 사진을 잡는 핵심이다.
   */
  const insufficientSideRoom =
    shoulderWidth >= 0.20 &&
    sideRoomToShoulderRatio < 0.50;


  /*
   * 어깨 관절 폭 자체가 화면 대부분을 차지하는 경우.
   *
   * 기존 0.82는 지나치게 느슨해서
   * 실제 타이트 크롭 대부분을 통과시켰다.
   */
  const shoulderWidthTooWide =
    shoulderWidth > 0.56;


  /*
   * 지나치게 좁으면
   * 한쪽 어깨 미검출 또는 Pose 오검출 가능성.
   */
  const shoulderWidthTooNarrow =
    shoulderWidth < 0.07;


  /*
   * 최종 좌우 어깨 크롭 판단
   */
  const shouldersTouchFrame =
    shoulderJointNearFrame ||
    estimatedShoulderOutsideFrame ||
    insufficientSideRoom ||
    shoulderWidthTooWide;


  // ------------------------------------------------
  // VERTICAL COMPOSITION
  // ------------------------------------------------

  const averageShoulderY =
    (
      leftShoulder.y +
      rightShoulder.y
    ) / 2;

  const roomBelowShoulders =
    1 - averageShoulderY;


  /*
   * 어깨가 거의 이미지 최하단에 위치하면
   * 실제 비자 사진 제작에 사용할 상체 공간이 없다.
   *
   * 기존 0.96은 사실상 거의 검출되지 않으므로
   * 지나치게 타이트한 하단 크롭을 잡을 수 있도록 조정.
   *
   * 단, 일반 상반신 사진을 과하게 차단하지 않도록
   * 0.90보다 아래에 있는 경우에만 사용한다.
   */
  const shouldersTooLow =
    averageShoulderY >= 0.90;


  /*
   * 어깨 아래 남은 공간이 지나치게 적은 경우.
   */
  const insufficientRoomBelowShoulders =
    roomBelowShoulders < 0.10;


  // ------------------------------------------------
  // FINAL POSE RESULT
  // ------------------------------------------------

  let pass = true;

  let reason =
    'POSE_OK';

  let message =
    'Both shoulders are visible and the source photo has sufficient composition.';

  let recoverable = false;


  if (!shouldersVisible) {
    pass = false;

    reason =
      'SHOULDERS_NOT_VISIBLE';

    message =
      'Both shoulders could not be verified. Embassy-Ready Upgrade is recommended.';

    recoverable = true;

  } else if (shoulderWidthTooNarrow) {
    pass = false;

    reason =
      'SHOULDERS_NOT_VERIFIED';

    message =
      'Both shoulders could not be verified clearly.';

    recoverable = true;

  } else if (shouldersTouchFrame) {
    pass = false;

    reason =
      'SHOULDERS_CROPPED';

    message =
      'The shoulders or upper body are cropped too tightly. Embassy-Ready Upgrade is recommended.';

    recoverable = true;

  } else if (
    shouldersTooLow ||
    insufficientRoomBelowShoulders
  ) {
    pass = false;

    reason =
      'INSUFFICIENT_SPACE_BELOW_SHOULDERS';

    message =
      'More upper-body space is required. Embassy-Ready Upgrade is recommended.';

    recoverable = true;
  }


  // ------------------------------------------------
  // DEBUG
  // ------------------------------------------------

  console.log(
    '========== POSE COMPOSITION DEBUG =========='
  );

  console.table({
    leftShoulderX:
      leftShoulder.x,

    rightShoulderX:
      rightShoulder.x,

    leftShoulderY:
      leftShoulder.y,

    rightShoulderY:
      rightShoulder.y,

    leftVisibility,
    rightVisibility,

    shouldersVisible,

    shoulderMinX,
    shoulderMaxX,

    shoulderWidth,

    leftShoulderRoom,
    rightShoulderRoom,

    minShoulderSideRoom,

    sideRoomToShoulderRatio,

    estimatedLeftOuterShoulder,
    estimatedRightOuterShoulder,

    shoulderJointNearFrame,
    estimatedShoulderOutsideFrame,
    insufficientSideRoom,

    shoulderWidthTooNarrow,
    shoulderWidthTooWide,

    shouldersTouchFrame,

    averageShoulderY,
    roomBelowShoulders,

    shouldersTooLow,
    insufficientRoomBelowShoulders,

    pass,
    reason,
    recoverable
  });


  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

  return {
    pass,
    reason,
    message,

    /*
     * 이 값은 상위 validation 로직에서
     * E.R.U 유도 여부를 판단할 때 사용할 수 있다.
     */
    recoverable,

    shouldersVisible,

    shoulderWidth,

    shoulderWidthTooNarrow,
    shoulderWidthTooWide,

    shouldersTouchFrame,

    leftShoulderRoom,
    rightShoulderRoom,

    minShoulderSideRoom,

    sideRoomToShoulderRatio,

    estimatedLeftOuterShoulder,
    estimatedRightOuterShoulder,

    averageShoulderY,
    roomBelowShoulders,

    shouldersTooLow,
    insufficientRoomBelowShoulders
  };
}
`;