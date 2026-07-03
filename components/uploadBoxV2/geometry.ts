export const uploadBoxGeometry = String.raw`
// ===== USVisaPhoto Geometry Engine v1 =====
function getLandmarkPoint(lm, index, iw, ih) {
  return {
    x: lm[index].x * iw,
    y: lm[index].y * ih,
    z: lm[index].z || 0
  };
}


function getFaceCenterX(lm, sourceWidth, fallbackCenterX) {
  if (!lm || !lm[234] || !lm[454]) {
    return fallbackCenterX;
  }

  return ((lm[234].x + lm[454].x) / 2) * sourceWidth;
}

function getEyeTilt(lm) {
  if (!lm || !lm[33] || !lm[263]) return 0;
  return Math.abs(lm[33].y - lm[263].y);
}

function getYawRatio(lm) {
  if (!lm || !lm[1] || !lm[234] || !lm[454]) return 1;
  const leftFace = Math.abs(lm[1].x - lm[234].x);
  const rightFace = Math.abs(lm[454].x - lm[1].x);
  return Math.min(leftFace, rightFace) / Math.max(leftFace, rightFace);
}

function getHeadMetrics(lm, iw, ih) {

  // ===== 이마(가장 위쪽) =====
  const foreheadCandidates = [
    lm[10],
    lm[338],
    lm[297],
    lm[332],
    lm[109],
    lm[67],
    lm[103]
  ]
  .filter(Boolean)
  .map(function(p) {
    return p.y * ih;
  });

  const foreheadY = Math.min.apply(null, foreheadCandidates);


  // ===== 턱(가장 아래쪽) =====
  const chinCandidates = [
    lm[152],
    lm[148],
    lm[176],
    lm[149],
    lm[377],
    lm[400],
    lm[378]
  ]
  .filter(Boolean)
  .map(function(p) {
    return p.y * ih;
  });

  const chinY = Math.max.apply(null, chinCandidates);


  // ===== 얼굴 높이 =====
  const faceHeight = Math.max(1, chinY - foreheadY);


  // ===== 정수리 추정 =====
  const estimatedCrownY = Math.max(
    0,
    foreheadY - faceHeight * 0.36
  );


  return {
    foreheadY,
    chinY,
    faceHeight,
    estimatedCrownY,
    crownToChinRatio: (chinY - estimatedCrownY) / ih,
    bottomSpaceRatio: (ih - chinY) / ih
  };
}
`;