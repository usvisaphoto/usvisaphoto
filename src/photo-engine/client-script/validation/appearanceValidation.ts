export const appearanceValidationScript = String.raw`
function validateAppearance(
  sourceImage,
  lm,
  iw,
  ih
) {
  const detectorLoaded =
    typeof window.detectGlassesValidation ===
    'function';

  const glasses =
    detectorLoaded
      ? window.detectGlassesValidation(
          sourceImage,
          lm,
          iw,
          ih
        )
      : {
          glassesDetected: false,
          confidence: 0,
          detectorLoaded: false
        };

  console.log(
    '========== APPEARANCE GLASSES DEBUG =========='
  );

  console.log({
    detectorLoaded,
    glassesDetected:
      Boolean(
        glasses &&
        glasses.glassesDetected
      ),
    confidence:
      Number(
        glasses &&
        Number.isFinite(
          glasses.confidence
        )
          ? glasses.confidence
          : 0
      ),
    glasses
  });

  const hair =
    detectHair(
      sourceImage,
      lm,
      iw,
      ih
    );

  const mask =
    detectMask(
      sourceImage,
      lm,
      iw,
      ih
    );

  const shadow =
    detectShadow(
      sourceImage,
      lm,
      iw,
      ih
    );

  const background =
    detectBackground(
      sourceImage,
      lm,
      iw,
      ih
    );

  return {
    glasses,
    hair,
    mask,
    shadow,
    background
  };
}

/* ---------- Hair ---------- */

function detectHair(
  sourceImage,
  lm,
  iw,
  ih
) {
  return {
    detected: false,
    confidence: 0
  };
}

/* ---------- Mask ---------- */

function detectMask(
  sourceImage,
  lm,
  iw,
  ih
) {
  return {
    detected: false,
    confidence: 0
  };
}

/* ---------- Shadow ---------- */

function detectShadow(
  sourceImage,
  lm,
  iw,
  ih
) {
  return {
    detected: false,
    confidence: 0
  };
}

/* ---------- Background ---------- */

function detectBackground(
  sourceImage,
  lm,
  iw,
  ih
) {
  return {
    detected: false,
    confidence: 0
  };
}
`;