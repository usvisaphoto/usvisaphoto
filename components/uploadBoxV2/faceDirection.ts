export const faceDirectionLogic = String.raw`
function detectFaceDirection(lm) {
  const leftFace = Math.abs(lm[1].x - lm[234].x);
  const rightFace = Math.abs(lm[454].x - lm[1].x);

  const yawRatio =
    Math.min(leftFace, rightFace) /
    Math.max(leftFace, rightFace);

  const noseCenterX = lm[1].x;
  const faceLeftX = lm[234].x;
  const faceRightX = lm[454].x;

  const faceWidth = Math.max(0.001, faceRightX - faceLeftX);

  const noseOffsetRatio =
    Math.abs(noseCenterX - ((faceLeftX + faceRightX) / 2)) / faceWidth;

  const faceNotStraight =
    yawRatio < 0.82 ||
    noseOffsetRatio > 0.075;

  return {
    yawRatio: yawRatio,
    noseOffsetRatio: noseOffsetRatio,
    faceNotStraight: faceNotStraight
  };
}
`;