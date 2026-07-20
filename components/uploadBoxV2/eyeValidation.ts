export const eyeValidationLogic = String.raw`
function detectEyes(lm) {
  function eyeOpenRatio(top, bottom, outer, inner) {
    const vertical = Math.abs(lm[top].y - lm[bottom].y);
    const horizontal = Math.abs(lm[outer].x - lm[inner].x);
    return horizontal ? vertical / horizontal : 0;
  }

  const leftEyeRatio = eyeOpenRatio(159, 145, 33, 133);
  const rightEyeRatio = eyeOpenRatio(386, 374, 362, 263);

  const EYE_CLOSED_RATIO = 0.095;

const eyesClosed =
  leftEyeRatio < EYE_CLOSED_RATIO &&
  rightEyeRatio < EYE_CLOSED_RATIO;

console.log(
  "Eye Ratio",
  "L:", leftEyeRatio.toFixed(3),
  "R:", rightEyeRatio.toFixed(3),
  "Closed:", eyesClosed
);

return {
    leftEyeRatio,
    rightEyeRatio,
    eyesClosed
};
}
`;