export const mouthValidationScript = String.raw`
function detectMouth(lm) {
  const mouthOpen = Math.abs(lm[13].y - lm[14].y);
  const faceHeight = Math.abs(lm[152].y - lm[10].y);
  const mouthRatio = mouthOpen / faceHeight;
  const mouthOpened = mouthRatio > 0.055;

  return {
    mouthRatio: mouthRatio,
    mouthOpened: mouthOpened
  };
}
`;

