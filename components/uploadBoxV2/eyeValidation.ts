export const eyeValidationLogic = String.raw`
function detectEyes(lm) {
  function eyeOpenRatio(top, bottom, outer, inner) {
    const vertical = Math.abs(lm[top].y - lm[bottom].y);
    const horizontal = Math.abs(lm[outer].x - lm[inner].x);
    return horizontal ? vertical / horizontal : 0;
  }

  const leftEyeRatio = eyeOpenRatio(159, 145, 33, 133);
  const rightEyeRatio = eyeOpenRatio(386, 374, 362, 263);

  const eyesClosed =
    leftEyeRatio < 0.16 ||
    rightEyeRatio < 0.16;

  return {
    leftEyeRatio: leftEyeRatio,
    rightEyeRatio: rightEyeRatio,
    eyesClosed: eyesClosed
  };
}
`;