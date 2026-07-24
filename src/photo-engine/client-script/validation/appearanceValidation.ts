export const appearanceValidationScript = String.raw`

function validateAppearance(sourceImage, lm, iw, ih) {

  const glasses = detectGlasses(sourceImage, lm, iw, ih);
  const hair = detectHair(sourceImage, lm, iw, ih);
  const mask = detectMask(sourceImage, lm, iw, ih);
  const shadow = detectShadow(sourceImage, lm, iw, ih);
  const background = detectBackground(sourceImage, lm, iw, ih);

  return {
    glasses,
    hair,
    mask,
    shadow,
    background
  };
}

/* ---------- Glasses ---------- */

function detectGlasses(sourceImage, lm, iw, ih){
  return {
    detected:false,
    confidence:0
  };
}

/* ---------- Hair ---------- */

function detectHair(sourceImage, lm, iw, ih){
  return {
    detected:false,
    confidence:0
  };
}

/* ---------- Mask ---------- */

function detectMask(sourceImage, lm, iw, ih){
  return {
    detected:false,
    confidence:0
  };
}

/* ---------- Shadow ---------- */

function detectShadow(sourceImage, lm, iw, ih){
  return {
    detected:false,
    confidence:0
  };
}

/* ---------- Background ---------- */

function detectBackground(sourceImage, lm, iw, ih){
  return {
    detected:false,
    confidence:0
  };
}

`;