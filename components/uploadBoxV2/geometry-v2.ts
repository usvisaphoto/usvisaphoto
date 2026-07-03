export const uploadBoxGeometryV2 = String.raw`
// ===== USVisaPhoto Geometry Engine V2 =====
// Purpose: stable, reusable head geometry for visa/passport photo generation.
// Important: this module is injected as plain browser JS via String.raw.
// Do not use TypeScript export/function imports inside this string.

const USV_GEOMETRY_V2_DEBUG = false;

function usvClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function usvNumber(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}

function usvMedian(values) {
  const clean = values
    .filter(function(v) { return typeof v === 'number' && isFinite(v); })
    .sort(function(a, b) { return a - b; });

  if (!clean.length) return 0;

  const mid = Math.floor(clean.length / 2);
  if (clean.length % 2) return clean[mid];
  return (clean[mid - 1] + clean[mid]) / 2;
}

function usvAverage(values) {
  const clean = values.filter(function(v) {
    return typeof v === 'number' && isFinite(v);
  });
  if (!clean.length) return 0;
  return clean.reduce(function(sum, v) { return sum + v; }, 0) / clean.length;
}

function usvPoint(lm, index, iw, ih) {
  if (!lm || !lm[index]) return null;
  return {
    x: lm[index].x * iw,
    y: lm[index].y * ih,
    z: lm[index].z || 0,
    index: index
  };
}

function usvPoints(lm, indexes, iw, ih) {
  return indexes
    .map(function(index) { return usvPoint(lm, index, iw, ih); })
    .filter(Boolean);
}

function usvMinY(points, fallback) {
  if (!points.length) return fallback;
  return Math.min.apply(null, points.map(function(p) { return p.y; }));
}

function usvMaxY(points, fallback) {
  if (!points.length) return fallback;
  return Math.max.apply(null, points.map(function(p) { return p.y; }));
}

function usvMinX(points, fallback) {
  if (!points.length) return fallback;
  return Math.min.apply(null, points.map(function(p) { return p.x; }));
}

function usvMaxX(points, fallback) {
  if (!points.length) return fallback;
  return Math.max.apply(null, points.map(function(p) { return p.x; }));
}

function usvDistance(a, b) {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function usvGetFaceCenterX(lm, sourceWidth, fallbackCenterX) {
  if (!lm || !lm[234] || !lm[454]) return fallbackCenterX;
  return ((lm[234].x + lm[454].x) / 2) * sourceWidth;
}

function usvGetYawRatio(lm) {
  if (!lm || !lm[1] || !lm[234] || !lm[454]) return 1;
  const leftFace = Math.abs(lm[1].x - lm[234].x);
  const rightFace = Math.abs(lm[454].x - lm[1].x);
  const maxSide = Math.max(leftFace, rightFace);
  if (!maxSide) return 1;
  return Math.min(leftFace, rightFace) / maxSide;
}

function usvGetEyeTilt(lm) {
  if (!lm || !lm[33] || !lm[263]) return 0;
  return Math.abs(lm[33].y - lm[263].y);
}

function usvGetFaceTiltAngle(lm) {
  if (!lm || !lm[33] || !lm[263]) return 0;
  const leftEye = lm[33];
  const rightEye = lm[263];
  return Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
}

function usvBuildFaceBox(lm, iw, ih) {
  const contourIndexes = [
    10, 338, 297, 332, 284, 251, 389, 356, 454,
    323, 361, 288, 397, 365, 379, 378, 400,
    377, 152, 148, 176, 149, 150, 136, 172,
    58, 132, 93, 234, 127, 162, 21, 54,
    103, 67, 109
  ];

  const points = usvPoints(lm, contourIndexes, iw, ih);

  const fallbackLeft = lm[234] ? lm[234].x * iw : iw * 0.35;
  const fallbackRight = lm[454] ? lm[454].x * iw : iw * 0.65;
  const fallbackTop = lm[10] ? lm[10].y * ih : ih * 0.20;
  const fallbackBottom = lm[152] ? lm[152].y * ih : ih * 0.70;

  const left = usvMinX(points, fallbackLeft);
  const right = usvMaxX(points, fallbackRight);
  const top = usvMinY(points, fallbackTop);
  const bottom = usvMaxY(points, fallbackBottom);

  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2
  };
}

function usvDetectStableChin(lm, iw, ih) {
  const chinIndexes = [
    152, 148, 176, 149, 150, 136, 172,
    377, 400, 378, 379, 365, 397
  ];

  const chinPoints = usvPoints(lm, chinIndexes, iw, ih);
  const yValues = chinPoints.map(function(p) { return p.y; });

  const maxY = usvMaxY(chinPoints, lm[152] ? lm[152].y * ih : ih * 0.72);
  const medianY = usvMedian(yValues);

  // Chin should use the lower envelope, but avoid a single outlier.
  const lowerCluster = yValues.filter(function(y) {
    return y >= medianY;
  });

  const stableLower = lowerCluster.length
    ? usvAverage(lowerCluster)
    : maxY;

  const chinY = Math.max(maxY * 0.78 + stableLower * 0.22, maxY - 2);

  return {
    y: usvClamp(chinY, 0, ih),
    confidence: chinPoints.length >= 7 ? 99 : 90,
    source: 'jaw-contour-lower-envelope'
  };
}

function usvDetectStableForehead(lm, iw, ih) {
  const foreheadIndexes = [10, 338, 297, 332, 109, 67, 103, 151, 9];
  const points = usvPoints(lm, foreheadIndexes, iw, ih);
  const ys = points.map(function(p) { return p.y; });

  const topY = usvMinY(points, lm[10] ? lm[10].y * ih : ih * 0.22);
  const medianY = usvMedian(ys);

  return {
    y: topY,
    medianY: medianY,
    confidence: points.length >= 6 ? 96 : 88,
    source: 'upper-face-contour'
  };
}

function usvEstimateCrownFromGeometry(lm, iw, ih, foreheadY, chinY, faceBox) {
  const faceHeight = Math.max(1, chinY - foreheadY);
  const faceWidth = Math.max(1, faceBox.width);

  // Human head above upper-face contour varies. This hybrid ratio is intentionally conservative.
  // It is designed for final crop math, not for showing a perfect visible crown guide.
  const widthFactor = usvClamp(faceWidth / faceHeight, 0.58, 0.95);
  const crownOffsetRatio = 0.30 + (widthFactor - 0.58) * 0.18;

  let crownY = foreheadY - faceHeight * crownOffsetRatio;

  // Do not allow crown to be too close to forehead; do not over-shoot too high.
  const minCrownY = foreheadY - faceHeight * 0.48;
  const maxCrownY = foreheadY - faceHeight * 0.22;

  crownY = usvClamp(crownY, minCrownY, maxCrownY);
  crownY = usvClamp(crownY, 0, ih);

  return {
    y: crownY,
    confidence: 88,
    source: 'hybrid-head-ellipse-estimate'
  };
}

function usvCalculateGeometryConfidence(parts) {
  let score = 100;

  if (parts.yawRatio < 0.72) score -= 30;
  else if (parts.yawRatio < 0.82) score -= 8;

  if (parts.eyeTilt > 0.04) score -= 16;
  else if (parts.eyeTilt > 0.025) score -= 5;

  if (parts.crownY <= 1) score -= 10;
  if (parts.chinY <= parts.crownY) score -= 50;

  if (parts.crownToChinRatio > 0.58) score -= 15;
  if (parts.bottomSpaceRatio < 0.22) score -= 15;

  return usvClamp(Math.round(score), 0, 100);
}

function detectHeadGeometryV2(lm, iw, ih) {
  const faceBox = usvBuildFaceBox(lm, iw, ih);
  const chin = usvDetectStableChin(lm, iw, ih);
  const forehead = usvDetectStableForehead(lm, iw, ih);
  const crown = usvEstimateCrownFromGeometry(lm, iw, ih, forehead.y, chin.y, faceBox);

  const faceHeight = Math.max(1, chin.y - forehead.y);
  const headHeight = Math.max(1, chin.y - crown.y);
  const yawRatio = usvGetYawRatio(lm);
  const eyeTilt = usvGetEyeTilt(lm);
  const centerX = usvGetFaceCenterX(lm, iw, iw / 2);
  const tiltAngle = usvGetFaceTiltAngle(lm);

  const crownToChinRatio = headHeight / ih;
  const bottomSpaceRatio = (ih - chin.y) / ih;

  const confidence = usvCalculateGeometryConfidence({
    yawRatio: yawRatio,
    eyeTilt: eyeTilt,
    crownY: crown.y,
    chinY: chin.y,
    crownToChinRatio: crownToChinRatio,
    bottomSpaceRatio: bottomSpaceRatio
  });

  const geometry = {
    version: 'v2',
    crownY: crown.y,
    chinY: chin.y,
    foreheadY: forehead.y,
    faceHeight: faceHeight,
    headHeight: headHeight,
    centerX: centerX,
    tiltAngle: tiltAngle,
    yawRatio: yawRatio,
    eyeTilt: eyeTilt,
    crownToChinRatio: crownToChinRatio,
    bottomSpaceRatio: bottomSpaceRatio,
    confidence: confidence,
    faceBox: faceBox,
    sources: {
      crown: crown.source,
      chin: chin.source,
      forehead: forehead.source
    }
  };

  if (USV_GEOMETRY_V2_DEBUG) {
    console.log('[USVisaPhoto Geometry V2]', geometry);
  }

  return geometry;
}

// Compatibility wrapper for existing logic.ts.
function getHeadMetricsV2(lm, iw, ih) {
  const g = detectHeadGeometryV2(lm, iw, ih);

  return {
    foreheadY: g.foreheadY,
    chinY: g.chinY,
    faceHeight: g.faceHeight,
    estimatedCrownY: g.crownY,
    crownToChinRatio: g.crownToChinRatio,
    bottomSpaceRatio: g.bottomSpaceRatio,
    centerX: g.centerX,
    tiltAngle: g.tiltAngle,
    confidence: g.confidence,
    geometry: g
  };
}
`;
