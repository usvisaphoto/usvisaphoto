export const uploadBoxLogic = String.raw`
const fileInput = document.getElementById('file-input');
const PROFESSIONAL_PREVIEW_VERSION = 'basic-matched-preview-v8';
const BASIC_OUTPUT_VERSION = 'natural-skin-v5';
const zone = document.getElementById('upload-zone');
const previewImg = document.getElementById('preview-img');
const placeholder = document.getElementById('placeholder');
const crownLine = document.getElementById('crown-line');
const chinLine = document.getElementById('chin-line');
const detectBtn = document.getElementById('detect-btn');
const createBtn = document.getElementById('create-btn');
const newPhotoBtn = document.getElementById('new-photo-btn');
const downloadBtn = document.getElementById('download-btn');
const photoTypeInputs = document.querySelectorAll('input[name="photoType"]');
const internationalPhotoWarning = document.getElementById('international-photo-warning');
const internationalPackageInfo = document.getElementById('international-package-info');
const retouchPreview = document.getElementById('retouch-preview');
const retouchImage = document.getElementById('retouch-image');
const premiumCreateBtn = document.getElementById('premium-create-btn');
const professionalRetouchBtn = document.getElementById('professional-retouch-btn');
const eruProgress = document.getElementById('eru-progress');
const eruProgressBar = document.getElementById('eru-progress-bar');
const eruProgressValue = document.getElementById('eru-progress-value');
const eruProgressLabel = document.getElementById('eru-progress-label');
const professionalInternationalCheckbox = { get checked() { const selected = document.querySelector('input[name="professionalExtraSize"]:checked'); return Boolean(selected && selected.value); } };
const basicPackageNote = document.getElementById('basic-package-note');
const basicEyebrowNote = document.getElementById('basic-eyebrow-note');
const eruEyebrowNote = document.getElementById('eru-eyebrow-note');
const basicDownloadSpec = document.getElementById('basic-download-spec');
const eruDownloadSpec = document.getElementById('eru-download-spec');
const expertEditBtn = document.getElementById('expert-edit-btn');
const canvas = document.getElementById('result-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');
const statusEl = document.getElementById('status');
const resultPanel = document.getElementById('resultPanel');
const eruLongArrow = document.querySelector('.eru-long-arrow');
const uploadTips = document.getElementById('uploadTips');
const validationCard = document.getElementById('validation-card');
const checkFace = document.getElementById('check-face');
const checkEyes = document.getElementById('check-eyes');
const checkMouth = document.getElementById('check-mouth');
const checkGlasses = document.getElementById('check-glasses');
const checkEyebrows = document.getElementById('check-eyebrows');
const checkPosition = document.getElementById('check-position');
const validationFinal = document.getElementById('validation-final');
const professionalCard = document.getElementById('professional-retouch-card');
const eruScrollBtn = document.getElementById('eru-scroll-btn');
const expertCard = document.getElementById('expert-edit-card');
const ctx = canvas.getContext('2d');
const PENDING_PAYMENT_KEY = 'usvisa_pending_payment';
const ACTIVE_PAYMENT_RETURN_KEY = 'usvisa_active_payment_return';
const CONFIRMED_PAYMENT_PREFIX = 'usvisa_confirmed_payment:';
const AUTO_DOWNLOAD_PREFIX = 'usvisa_auto_downloaded:';
const PENDING_PAYMENT_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_PAID_DOWNLOADS = 5;

function isLocalAdminEnvironment() {
  try {
    const parentHostname = window.parent.location.hostname;

    return (
      parentHostname === "localhost" ||
      parentHostname === "127.0.0.1"
    );
  } catch (error) {
    return false;
  }
}

if (isLocalAdminEnvironment() && downloadBtn) {
  const previewHost = createBtn && createBtn.parentElement;

  if (previewHost) {
    previewHost.insertBefore(downloadBtn, createBtn.nextSibling);
  }
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');

  if (parts.length !== 2) {
    throw new Error('Invalid image data URL.');
  }

  const mimeMatch =
    parts[0].match(/data:(.*?);base64/);

  const mimeType =
    mimeMatch && mimeMatch[1]
      ? mimeMatch[1]
      : 'image/jpeg';

  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], {
    type: mimeType
  });
}

function triggerAdminFileDownload(
  blob,
  filename
) {
  const downloadUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = downloadUrl;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(function () {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

function getAdminDownloadTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month =
    String(now.getMonth() + 1).padStart(2, '0');
  const day =
    String(now.getDate()).padStart(2, '0');
  const hour =
    String(now.getHours()).padStart(2, '0');
  const minute =
    String(now.getMinutes()).padStart(2, '0');
  const second =
    String(now.getSeconds()).padStart(2, '0');

  return (
    year +
    month +
    day +
    '_' +
    hour +
    minute +
    second
  );
}


function getSelectedBasicPackage() {
  const selected = document.querySelector(
    'input[name="photoType"]:checked'
  );

  return selected && selected.value !== 'visa-only'
    ? 'visa-plus-international'
    : 'visa-only';
}

function getSelectedBasicExtraSize() {
  const selected = document.querySelector('input[name="photoType"]:checked');
  return selected && selected.value.indexOf('addon-') === 0 ? selected.value.replace('addon-', '') : '';
}

function getSelectedProfessionalExtraSizes() {
  return Array.from(
    document.querySelectorAll(
      'input[name="professionalExtraSize"]:checked'
    )
  )
    .map(function(input) {
      return input.value;
    })
    .filter(Boolean);
}

function getSelectedProfessionalExtraSize() {
  const sizes = getSelectedProfessionalExtraSizes();
  return sizes.length ? sizes[0] : '';
}

function requiresEyebrowClearanceForSize(sizeKey) {
  return sizeKey === '35x45';
}

function requiresDarkClothingForSize(sizeKey) {
  return sizeKey === '35x45';
}

function countryRequiresEyebrowClearance() {
  return (
    COUNTRY_CODE === 'KR' ||
    COUNTRY_CODE === 'JP' ||
    COUNTRY_CODE === 'CN'
  );
}

function countryRequiresDarkClothing() {
  return (
    COUNTRY_CODE === 'KR' ||
    COUNTRY_CODE === 'JP' ||
    COUNTRY_CODE === 'CN'
  );
}

function canSelectProfessionalExtraSize(sizeKey) {
  if (
    requiresEyebrowClearanceForSize(sizeKey) &&
    currentEyebrowOverlapDetected
  ) {
    return {
      allowed: false,
      reason: 'EYEBROWS_COVERED'
    };
  }

  return {
    allowed: true,
    reason: null
  };
}

const ERU_BASE_PRICE = 9.99;
const ERU_EXTRA_SIZE_PRICE = 3.00;

function getProfessionalTotalPrice() {
  const extraCount =
    getSelectedProfessionalExtraSizes().length;

  return (
    ERU_BASE_PRICE +
    extraCount * ERU_EXTRA_SIZE_PRICE
  );
}

const ADDITIONAL_DOWNLOAD_SPECS = Object.freeze({
  '35x45': { label: '3.5 × 4.5 cm', pixels: '413 × 531 px', ratio: '7:9' },
  '2x2': { label: '2 × 2 inch', pixels: '600 × 600 px', ratio: '1:1' },
  '30x40': { label: '3 × 4 cm', pixels: '354 × 472 px', ratio: '3:4' },
  '20x30': { label: '2 × 3 cm', pixels: '236 × 354 px', ratio: '2:3' },
  '40x60': { label: '4 × 6 cm', pixels: '472 × 709 px', ratio: '2:3' },
  '50x70': { label: '5 × 7 cm', pixels: '591 × 827 px', ratio: '5:7' },
});

function simplifyRatio(width, height) {
  let a = Math.max(1, Math.round(Number(width) || 1));
  let b = Math.max(1, Math.round(Number(height) || 1));
  const originalA = a;
  const originalB = b;

  while (b) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return (originalA / a) + ':' + (originalB / a);
}

function getDefaultDownloadSpec() {
  const profile = window.EMBASSY_PHOTO_PROFILE || {};
  const width = Number(profile.pixelWidth || 600);
  const height = Number(profile.pixelHeight || 600);
  return {
    label: String(profile.sizeLabel || '2 × 2 inch'),
    pixels: width + ' × ' + height + ' px',
    ratio: simplifyRatio(Number(profile.widthMm || width), Number(profile.heightMm || height)),
  };
}

function renderDownloadSpec(target, extraSizes) {
  if (!target) return;

  const primary = getDefaultDownloadSpec();

  const selectedSizes = Array.isArray(extraSizes)
    ? extraSizes
    : extraSizes
      ? [extraSizes]
      : [];

  let html =
    '<strong>Actual download</strong>' +
    '<span>' +
    primary.label +
    ' · ' +
    primary.pixels +
    ' · ' +
    primary.ratio +
    ' · JPG · 300 DPI</span>';

  selectedSizes.forEach(function(sizeKey) {
    const extra = ADDITIONAL_DOWNLOAD_SPECS[sizeKey];

    if (!extra) return;

    html +=
      '<span class="download-spec-extra">' +
      '＋ ' +
      extra.label +
      ' · ' +
      extra.pixels +
      ' · ' +
      extra.ratio +
      ' · JPG · 300 DPI' +
      '</span>';
  });

  target.innerHTML = html;
}

function updateDownloadSpecs() {
  renderDownloadSpec(
    basicDownloadSpec,
    getSelectedBasicExtraSize()
  );

  renderDownloadSpec(
    eruDownloadSpec,
    getSelectedProfessionalExtraSizes()
  );
}



function updateProfessionalPackageButton() {
  const selectedSizes =
    getSelectedProfessionalExtraSizes();

  const extraCount =
    selectedSizes.length;

  const totalPrice =
    9.99 + (extraCount * 3);

  const totalText =
    '$' + totalPrice.toFixed(2);

  const totalPriceEl =
    document.getElementById('eru-total-price');
   
  const mainPriceEl =
  document.getElementById('eru-main-price');

if (mainPriceEl) {
  mainPriceEl.textContent = totalText;
}
    
  if (totalPriceEl) {
    totalPriceEl.innerHTML =
      'Total · <strong>' +
      totalText +
      '</strong>' +
      (
        extraCount > 0
          ? ' <span style="font-size:12px;font-weight:600;opacity:.7;">' +
            '(+$3 × ' +
            extraCount +
            ')</span>'
          : ''
      );
  }

  if (premiumCreateBtn) {
    premiumCreateBtn.textContent =
      extraCount > 0
        ? '🔓 Unlock Embassy-Ready Photos · ' + totalText
        : '🔓 Unlock Embassy-Ready Photo · $9.99';
  }

  updateDownloadSpecs();
}

function updateEyebrowClearanceNotes() {
  const basicRequired = COUNTRY_CODE === 'KR' || (COUNTRY_CODE === 'US' && getSelectedBasicExtraSize() === '35x45');
  const eruRequired = COUNTRY_CODE === 'KR' || (COUNTRY_CODE === 'US' && getSelectedProfessionalExtraSize() === '35x45');
  if (basicEyebrowNote) {
    basicEyebrowNote.style.display = basicRequired ? 'block' : 'none';
    basicEyebrowNote.textContent = 'Eyebrow clearance required. Basic preserves the original hair and eyebrow pixels; use E.R.U if hair overlaps either eyebrow.';
  }
  if (eruEyebrowNote) {
    eruEyebrowNote.style.display = eruRequired ? 'block' : 'none';
    eruEyebrowNote.textContent = 'E.R.U will keep the original eyebrow shape and clear only hair strands that overlap the eyebrows.';
  }
}

document.querySelectorAll('input[name="professionalExtraSize"]').forEach(function(input) { input.addEventListener('change', function() { updateProfessionalPackageButton(); updateEyebrowClearanceNotes(); }); });

updateProfessionalPackageButton();
function setBasicPackageSelection(packageName) {
  if (
    packageName !== 'visa-only' &&
    packageName !== 'visa-plus-international'
  ) {
    return;
  }

  photoTypeInputs.forEach(function (input) {
    input.checked = packageName === 'visa-only' ? input.value === 'visa-only' : input.value !== 'visa-only' && input === Array.from(photoTypeInputs).find(function(item) { return item.value !== 'visa-only'; });
  });
}

function hideBasicPackageHelpPanels() {
  if (basicPackageNote) {
    basicPackageNote.style.display = 'none';
  }

  if (internationalPackageInfo) {
    internationalPackageInfo.style.display = 'none';
  }

  if (internationalPhotoWarning) {
    internationalPhotoWarning.style.display = 'none';
  }
}

function updateBasicPackageHelpPanels(packageName) {
  if (basicPackageNote) {
    basicPackageNote.style.display =
      packageName === 'visa-only'
        ? 'block'
        : 'none';
  }

  if (internationalPackageInfo) {
    internationalPackageInfo.style.display =
      packageName === 'visa-plus-international'
        ? 'block'
        : 'none';
  }

  if (internationalPhotoWarning) {
    internationalPhotoWarning.style.display =
      packageName === 'visa-plus-international'
        ? 'block'
        : 'none';
  }
}

function syncBasicPackageUiForPaidProduct(product) {
  if (product === 'basic') {
    setBasicPackageSelection('visa-only');
  }

  if (product === 'basic-international') {
    setBasicPackageSelection('visa-plus-international');
  }

  hideBasicPackageHelpPanels();
}

function updateBasicPackageButton() {
  if (!downloadBtn) return;

  // Basic $4.99 / $7.99 checkout has been discontinued.
  // Keep the internal element for legacy code references, but never expose it.
  downloadBtn.style.display = 'none';
  downloadBtn.setAttribute('aria-hidden', 'true');
}
updateProfessionalPackageButton();

photoTypeInputs.forEach(function (input) {
  input.addEventListener('change', function() { updateBasicPackageButton(); updateEyebrowClearanceNotes(); updateDownloadSpecs(); });
});
updateBasicPackageButton();

canvas.oncontextmenu = function (e) {
  e.preventDefault();
  return false;
};

canvas.addEventListener('dragstart', function (e) {
  e.preventDefault();
});

canvas.style.userSelect = 'none';
canvas.style.webkitUserDrag = 'none';


// Keep the iframe layout width stable when validation content adds vertical scrolling.
// Without this, the browser creates a scrollbar after Auto Detect and the preview appears to shift left.
document.documentElement.style.overflowY = 'scroll';
document.body.style.overflowY = 'scroll';
document.documentElement.style.scrollbarGutter = 'stable';
document.body.style.scrollbarGutter = 'stable';

const COUNTRY_PROFILE = window.EMBASSY_PHOTO_PROFILE || { code: 'US', country: 'United States', flag: '🇺🇸', sizeLabel: '2 × 2 inch', widthMm: 50.8, heightMm: 50.8, pixelWidth: 600, pixelHeight: 600, headHeightMm: 28, topMarginMm: 5.5, accent: '#22c55e', accentSoft: '#dcfce7', ink: '#082f49' };
const EYEBROW_CLEARANCE_REQUIRED =
  COUNTRY_PROFILE.code === 'KR' || COUNTRY_PROFILE.code === 'CN';

function inspectEyebrowHairOverlap(lm, iw, ih, sourceImage) {
  try {
    const analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = iw;
    analysisCanvas.height = ih;
    const analysisContext = analysisCanvas.getContext('2d', {
      willReadFrequently: true
    });

    if (!analysisContext || !sourceImage) {
      return { overlap: true, uncertain: true };
    }

    analysisContext.drawImage(sourceImage, 0, 0, iw, ih);
    const pixels = analysisContext.getImageData(0, 0, iw, ih).data;
    const eyeSpan = Math.max(8, Math.abs(lm[263].x - lm[33].x) * iw);
    const sampleRadius = Math.max(2, Math.round(eyeSpan * 0.018));
    const skinLandmarks = [1, 4, 168, 50, 280];
    const skinSamples = [];

    function readPixel(x, y) {
      const px = Math.max(0, Math.min(iw - 1, Math.round(x)));
      const py = Math.max(0, Math.min(ih - 1, Math.round(y)));
      const offset = (py * iw + px) * 4;
      return {
        r: pixels[offset],
        g: pixels[offset + 1],
        b: pixels[offset + 2]
      };
    }

    skinLandmarks.forEach(function(index) {
      const point = lm[index];
      if (!point) return;
      const cx = point.x * iw;
      const cy = point.y * ih;

      for (let oy = -sampleRadius; oy <= sampleRadius; oy += 1) {
        for (let ox = -sampleRadius; ox <= sampleRadius; ox += 1) {
          skinSamples.push(readPixel(cx + ox, cy + oy));
        }
      }
    });

    if (!skinSamples.length) {
      return { overlap: true, uncertain: true };
    }

    const sortedLuma = skinSamples
      .map(function(color) {
        return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
      })
      .sort(function(a, b) { return a - b; });
    const skinLuma = sortedLuma[Math.floor(sortedLuma.length * 0.65)];
    const browSets = [
      [70, 63, 105, 66, 107],
      [336, 296, 334, 293, 300]
    ];
    const verticalSpan = Math.max(7, eyeSpan * 0.23);
    const browGap = Math.max(2, eyeSpan * 0.028);
    const columnRadius = Math.max(1, Math.round(eyeSpan * 0.008));
    const sideResults = [];

    browSets.forEach(function(indices) {
      const points = indices
        .map(function(index) { return lm[index]; })
        .filter(Boolean)
        .map(function(point) {
          return { x: point.x * iw, y: point.y * ih };
        })
        .sort(function(a, b) { return a.x - b.x; });
      let connectedColumns = 0;
      let inspectedColumns = 0;

      for (let segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex += 1) {
        const start = points[segmentIndex];
        const end = points[segmentIndex + 1];
        const steps = Math.max(4, Math.round(Math.abs(end.x - start.x) / 3));

        for (let step = 0; step <= steps; step += 1) {
          const t = step / steps;
          const x = start.x + (end.x - start.x) * t;
          const browY = start.y + (end.y - start.y) * t;
          const nearY = browY - browGap;
          const rowEvidence = [];

          for (let offsetY = 0; offsetY <= verticalSpan; offsetY += 1) {
            let rowHair = false;

            for (let offsetX = -columnRadius; offsetX <= columnRadius; offsetX += 1) {
              const color = readPixel(x + offsetX, nearY - offsetY);
              const luma = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
              const channelRange = Math.max(color.r, color.g, color.b) -
                Math.min(color.r, color.g, color.b);
              const hairLike =
                luma < Math.min(132, skinLuma * 0.70) &&
                (channelRange < 82 || luma < 82);

              if (hairLike) {
                rowHair = true;
                break;
              }
            }

            rowEvidence.push(rowHair);
          }

          const nearWindow = Math.max(3, Math.round(verticalSpan * 0.18));
          const beginsAtBrow = rowEvidence
            .slice(0, nearWindow)
            .filter(Boolean).length >= 2;
          let connectedRun = 0;
          let gapAllowance = 1;

          if (beginsAtBrow) {
            for (let rowIndex = 0; rowIndex < rowEvidence.length; rowIndex += 1) {
              if (rowEvidence[rowIndex]) {
                connectedRun += 1;
                gapAllowance = 1;
              } else if (connectedRun > 0 && gapAllowance > 0) {
                gapAllowance -= 1;
              } else if (connectedRun > 0) {
                break;
              }
            }
          }

          inspectedColumns += 1;
          if (
            beginsAtBrow &&
            connectedRun >= Math.max(5, verticalSpan * 0.42)
          ) {
            connectedColumns += 1;
          }
        }
      }

      sideResults.push({
        connectedColumns,
        inspectedColumns,
        ratio: connectedColumns / Math.max(1, inspectedColumns)
      });
    });

    const overlap = sideResults.some(function(side) {
      return side.connectedColumns >= 3 && side.ratio >= 0.10;
    });

    console.log('EYEBROW CLEARANCE DEBUG', {
      country: COUNTRY_PROFILE.code,
      skinLuma,
      sideResults,
      overlap
    });

    return { overlap, uncertain: false, sideResults };
  } catch (error) {
    console.error('EYEBROW CLEARANCE ERROR:', error);
    return { overlap: true, uncertain: true };
  }
}
const COUNTRY_CODE = String(COUNTRY_PROFILE.code || 'US');
const GLASSES_RULE_ENABLED = ['US', 'IN', 'CN'].includes(COUNTRY_CODE);
if (['KR', 'JP', 'CN'].includes(COUNTRY_CODE)) {
  document.body.classList.add('compact-east-asia-preview');
}
const TARGET = 600;
const TARGET_HEIGHT = Math.round(TARGET * Number(COUNTRY_PROFILE.heightMm || 50.8) / Number(COUNTRY_PROFILE.widthMm || 50.8));
const TARGET_HEAD_PX = TARGET_HEIGHT * (Number(COUNTRY_PROFILE.headHeightMm || 28) / Number(COUNTRY_PROFILE.heightMm || 50.8));
const TOP_MARGIN_PX = TARGET_HEIGHT * (Number(COUNTRY_PROFILE.topMarginMm || 5.5) / Number(COUNTRY_PROFILE.heightMm || 50.8));

document.documentElement.style.setProperty('--country-accent', COUNTRY_PROFILE.accent || '#22c55e');
document.documentElement.style.setProperty('--country-soft', COUNTRY_PROFILE.accentSoft || '#dcfce7');
const resultBadgeSubtitle = document.getElementById('result-badge-subtitle');
const primaryPhotoName = document.getElementById('primary-photo-name');
const primaryPhotoSize = document.getElementById('primary-photo-size');
if (resultBadgeSubtitle) resultBadgeSubtitle.textContent = COUNTRY_PROFILE.sizeLabel + ' · 300 DPI';
if (primaryPhotoName) primaryPhotoName.textContent = COUNTRY_PROFILE.country + ' Passport Photo';
if (primaryPhotoSize) primaryPhotoSize.textContent = COUNTRY_PROFILE.sizeLabel;
if (!GLASSES_RULE_ENABLED) {
  if (checkGlasses) checkGlasses.style.display = 'none';
  if (uploadTips) uploadTips.innerHTML = '<strong>For the best result</strong><br />Look directly at the camera, keep both eyes open, close your mouth, and remove hats or head coverings.<br /><br />Need help? <a href="mailto:usvisaphoto1@gmail.com">Contact our photo team</a>.';
}
const DEFAULT_SIZE_KEY = Math.abs(Number(COUNTRY_PROFILE.widthMm) - 50.8) < 0.2 && Math.abs(Number(COUNTRY_PROFILE.heightMm) - 50.8) < 0.2 ? '2x2' : Number(COUNTRY_PROFILE.widthMm) === 35 && Number(COUNTRY_PROFILE.heightMm) === 45 ? '35x45' : Number(COUNTRY_PROFILE.widthMm) === 30 && Number(COUNTRY_PROFILE.heightMm) === 40 ? '30x40' : Number(COUNTRY_PROFILE.widthMm) === 20 && Number(COUNTRY_PROFILE.heightMm) === 30 ? '20x30' : Number(COUNTRY_PROFILE.widthMm) === 40 && Number(COUNTRY_PROFILE.heightMm) === 60 ? '40x60' : '';
if (DEFAULT_SIZE_KEY) document.querySelectorAll('[data-size-key="' + DEFAULT_SIZE_KEY + '"]').forEach(function(option) { option.style.display = 'none'; });
updateEyebrowClearanceNotes();

let guideMode = 'auto';
let uploadedFile = null;
let uploadedImg = null;
let bgRemovedImg = null;
let localEruFinalJpg = null;
let localEruExtraPhotos = [];
let detectedLm = null;
let lockedDetection = null;
let resultUrl = null;
let faceTiltAngle = 0;
let photoValidationPassed = false;
let draggingLine = null;
let autoDetectLocked = false;
let faceMesh = null;
let selectedPhotoType = 'visa';
let professionalPreviewLocked = false;
let lockedDetectionFingerprint = '';
let professionalRetouchBusy = false;
let currentEyebrowOverlapDetected = false;

function median(values) {
  if (!values.length) return 0;

  const sorted = values.slice().sort(function(a, b) {
    return a - b;
  });

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildMedianLandmarks(resultsList) {

  if (!resultsList.length) return null;

  const landmarkCount = resultsList[0].length;

  const stable = [];

  for (let i = 0; i < landmarkCount; i++) {

    const xs = [];
    const ys = [];
    const zs = [];

    for (const lm of resultsList) {

      xs.push(lm[i].x);
      ys.push(lm[i].y);
      zs.push(lm[i].z || 0);

    }

    stable.push({

      x: median(xs),
      y: median(ys),
      z: median(zs)

    });

  }

  return stable;

}
function setDetectButtonState(state){

    detectBtn.classList.remove(
        'detect-auto',
        'detect-success',
        'detect-manual'
    );

    switch(state){

        case 'auto':
            detectBtn.classList.add('detect-auto');
            detectBtn.textContent='Auto Detect';
            detectBtn.disabled=false;
            detectBtn.style.cursor='pointer';
            break;

    case 'success':
  detectBtn.classList.add('detect-success');
  detectBtn.textContent = 'PASS';
  detectBtn.disabled = false;
  detectBtn.style.cursor = 'default';
  detectBtn.style.background = '#10b981';
  detectBtn.style.color = '#ffffff';
  break;
  
        case 'manual':
            detectBtn.classList.add('detect-manual');
            detectBtn.textContent='Adjusted';
            detectBtn.disabled=false;
            detectBtn.style.cursor='default';
            break;

case 'warning':
  detectBtn.classList.add('detect-manual');
  detectBtn.textContent = 'REVIEW & CONTINUE ✓';
  detectBtn.disabled = false;
  detectBtn.style.cursor = 'pointer';
  detectBtn.style.background = '#f59e0b';
  detectBtn.style.color = '#ffffff';
  break;


case 'deny':
  detectBtn.classList.add('detect-manual');
  detectBtn.textContent = 'DENY';
  detectBtn.disabled = false;
  detectBtn.style.cursor = 'default';
  detectBtn.style.background = '#dc2626';
  detectBtn.style.color = '#ffffff';
  break;


    }

    detectBtn.style.opacity='1';
}

function setCreateEnabled(enabled) {
  photoValidationPassed = !!enabled;
  if (!createBtn) return;
  createBtn.disabled = !enabled;
  createBtn.style.opacity = enabled ? '1' : '0.45';
  createBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
}

function hasLockedDetectionForCurrentPhoto() {
  if (!lockedDetection) {
    return false;
  }

  if (!currentPhotoFingerprint) {
    return true;
  }

  if (!lockedDetectionFingerprint) {
    lockedDetectionFingerprint = currentPhotoFingerprint;
    return true;
  }

  return lockedDetectionFingerprint === currentPhotoFingerprint;
}

function ensureCreateReadyForCurrentPhoto() {
  if (
    lockedDetection &&
    Number.isFinite(lockedDetection.crownY) &&
    Number.isFinite(lockedDetection.chinY) &&
    lockedDetection.chinY > lockedDetection.crownY
  ) {
    photoValidationPassed = true;
    if (currentPhotoFingerprint && !lockedDetectionFingerprint) {
      lockedDetectionFingerprint = currentPhotoFingerprint;
    }
    return true;
  }

  if (!photoValidationPassed || !lockedDetection) {
    return false;
  }

  if (!currentPhotoFingerprint) {
    return true;
  }

  if (!lockedDetectionFingerprint) {
    lockedDetectionFingerprint = currentPhotoFingerprint;
    return true;
  }

  if (lockedDetectionFingerprint === currentPhotoFingerprint) {
    return true;
  }

  const storedAutoDetect =
    getStoredAutoDetectResult(currentPhotoFingerprint);

  if (
    storedAutoDetect &&
    storedAutoDetect.status === 'PASS' &&
    storedAutoDetect.detection
  ) {
    lockedDetection = storedAutoDetect.detection;
    lockedDetectionFingerprint = currentPhotoFingerprint;
    faceTiltAngle = lockedDetection.faceTiltAngle || 0;
    window.usvisaLastValidationReport =
      storedAutoDetect.report || null;
    setCreateEnabled(true);
    return true;
  }

  return false;
}

function showCreatePhotoButton() {
  if (!createBtn) return;
  createBtn.style.display = '';
}

function setDownloadEnabled(enabled) {
  if (!downloadBtn) return;
  downloadBtn.disabled = !enabled;
  downloadBtn.style.opacity = enabled ? '1' : '0.55';
  downloadBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
}

function resetValidationUI() {
  if (validationCard) {
    validationCard.style.display = 'none';
    validationCard.className = 'validation-card';
  }
  if (checkFace) checkFace.textContent = '';
  if (checkEyes) checkEyes.textContent = '';
  if (checkMouth) checkMouth.textContent = '';
  if (checkGlasses) checkGlasses.textContent = '';
  if (checkPosition) checkPosition.textContent = '';
  if (validationFinal) validationFinal.textContent = '';
}


function showValidationError(message) {

    console.group("showValidationError");
    console.log(message);
    console.trace();
    console.groupEnd();

    const errorHtml =
      '<div style="font-size:20px;font-weight:900;color:#b91c1c;">DENY</div>' +
      '<div style="margin-top:10px;line-height:1.7;">' +
      message +
      '</div>';

if (validationCard) {
  validationCard.style.display = 'block';
  validationCard.className = 'validation-card validation-error';
}

if (validationFinal) {
  validationFinal.innerHTML = errorHtml;
}

statusEl.textContent = 'Photo validation failed. The exact reason is shown in the report below.';
setCreateEnabled(false);
setDetectButtonState('deny');
photoValidationPassed = false;

if (currentPhotoFingerprint) {
  saveAutoDetectDeny(
    currentPhotoFingerprint,
    message
  );
}

  setTimeout(function () {
    if (validationCard) {
      validationCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, 100);
}

function showValidationReady() {
setBasicPhotoSectionVisible(true);
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className = 'validation-card validation-success';
  }

  showCreatePhotoButton();
  setCreateEnabled(true);
  setDetectButtonState('success');
  setTimeout(function () {
    showCreatePhotoButton();
    setCreateEnabled(true);
  }, 0);
  setTimeout(function () {
    showCreatePhotoButton();
    setCreateEnabled(true);
  }, 250);

  const report = window.usvisaLastValidationReport || {
    score: 98,
    headSizeText: 'Head size checked',
    centerText: 'Face centered',
    originalText: 'Original photo check passed'
  };

  [
  checkFace,
  checkEyes,
  checkMouth,
  checkGlasses,
  checkPosition
].forEach(function (element) {
  if (element) {
    element.style.display = 'none';
  }
});

  if (validationFinal) {
  validationFinal.innerHTML =
    '<div style="font-size:15px;font-weight:900;line-height:1.9;">' +
    '<div>✅ Face detected</div>' +
    '<div>✅ One person only</div>' +
    '<div>✅ Eyes open</div>' +
    '<div>✅ Mouth closed</div>' +
    '<div>✅ Face looking forward</div>' +
    '<div>✅ No hats or head coverings detected</div>' +
    '<div>✅ Head size accepted</div>' +
    '<div>✅ Shoulder space accepted</div>' +
    '<hr style="margin:12px 0;border:none;border-top:1px solid #9ca3af;" />' +
    '<div style="font-size:20px;color:#047857;font-weight:900;">PASS</div>' +
    '<div style="font-size:14px;color:#065f46;margin-top:4px;">Your photo passed the automatic inspection.</div>' +
    '</div>';
  }

  autoDetectLocked = true;

  statusEl.innerHTML =
    '✅ Auto detection completed.<br>Please review the validation report before creating your photo.';
}
function setBasicPhotoSectionVisible(visible) {
  const display = visible ? "" : "none";

  const resultTitle = document.querySelector(".result-title");
  const resultSubtitle = document.querySelector(".result-subtitle");
  const resultCanvasWrap = document.querySelector(".result-canvas-wrap");
  const photoTypeCard = document.getElementById("photo-type-card");
  const basicDownloadBtn = document.getElementById("download-btn");
  
  if (resultTitle) resultTitle.style.display = display;
  if (resultSubtitle) resultSubtitle.style.display = display;
  if (resultCanvasWrap) resultCanvasWrap.style.display = display;
  if (photoTypeCard) photoTypeCard.style.display = display;
  if (basicDownloadBtn) basicDownloadBtn.style.display = display;
  }

function getCurrentImage() {
  return bgRemovedImg || uploadedImg;
}

function showValidationRecoverable(message) {
  const createBtn = document.getElementById("create-photo-btn");

  

  setBasicPhotoSectionVisible(false);

if (professionalCard) {
  professionalCard.style.display = "block";
}

if (expertCard) {
  expertCard.style.display = "block";
}
const eruLongArrow = document.querySelector('.eru-long-arrow');
if (eruLongArrow) {
  eruLongArrow.style.display = 'none';
}

const eruIncludedNote = document.getElementById('eru-included-note');
if (eruIncludedNote) {
  eruIncludedNote.style.display = 'none';
}
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className =
      'validation-card validation-warning';
  }

  if (validationFinal) {
    validationFinal.innerHTML =
      '<div style="font-size:20px;font-weight:700;color:#d97706;">' +
        '⚠ RECOVERABLE' +
      '</div>' +

      '<div style="margin-top:10px;line-height:1.7;">' +
        message +
      '</div>' +

      '<hr style="margin:14px 0;">' +

      '<div style="margin-top:12px;padding:10px 12px;background:#fff7ed;border:1px solid #fdba74;border-radius:10px;color:#c2410c;font-weight:900;font-size:14px;">' +
  '↑ Click REVIEW above to continue' +
'</div>' +

'<div style="margin-top:10px;color:#047857;font-weight:700;">' +
  '✓ Embassy-Ready Upgrade can prepare recoverable photo issues before payment.' +
'</div>';
if (detectBtn) {
  detectBtn.disabled = false;
 detectBtn.textContent = "REVIEW & CONTINUE ✓";
  detectBtn.style.background = "#f59e0b";
  detectBtn.style.color = "#ffffff";
  detectBtn.style.cursor = "pointer";

  // REVIEW navigation is handled by the main
  // detectBtn addEventListener below.
  detectBtn.onclick = null;
}

if (createBtn) {
  createBtn.style.display = "none";
}
  }
  } 

function showValidationExpertOnly(message) {

  setBasicPhotoSectionVisible(false);

  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className =
      'validation-card validation-warning';
  }

  if (validationFinal) {
    validationFinal.innerHTML =
      '<div style="font-size:20px;font-weight:700;color:#d97706;">' +
        'MANUAL EDITING REQUIRED' +
      '</div>' +
      '<div style="margin-top:10px;line-height:1.7;">' +
        message +
      '</div>';
  }
}

function restoreStoredAutoDetectResult() {
  const storedAutoDetect =
    getStoredAutoDetectResult(currentPhotoFingerprint);

  if (!storedAutoDetect) {
    return false;
  }

  if (
    storedAutoDetect.status === 'PASS' &&
    storedAutoDetect.detection
  ) {
    lockedDetection = storedAutoDetect.detection;
    lockedDetectionFingerprint = currentPhotoFingerprint || '';
    faceTiltAngle = lockedDetection.faceTiltAngle || 0;
    window.usvisaLastValidationReport =
      storedAutoDetect.report || null;

    showCreatePhotoButton();
    setCreateEnabled(true);
    autoDetectLocked = true;
    showValidationReady();

    statusEl.innerHTML =
      '✅ Auto detection restored.<br>You can create the photo or run Auto Detect again after choosing another photo.';

    return true;
  }

  if (
    storedAutoDetect.status === 'REVIEW' &&
    storedAutoDetect.detection
  ) {
    lockedDetection = storedAutoDetect.detection;
    lockedDetectionFingerprint = currentPhotoFingerprint || '';
    faceTiltAngle = lockedDetection.faceTiltAngle || 0;
    window.usvisaRecoverable = true;

    photoValidationPassed = false;
    autoDetectLocked = true;

    setDetectButtonState('warning');
setCreateEnabled(false);

showValidationRecoverable(
  storedAutoDetect.message ||
  'This photo is eligible for Professional Retouch or Expert Manual Editing.'
);
    if (createBtn) {
      createBtn.style.display = 'none';
    }

    if (professionalCard) {
      professionalCard.style.display = 'block';
    }

    if (professionalRetouchBtn) {
      professionalRetouchBtn.style.display = 'block';
      applyProfessionalPreviewDailyState();
    }

    if (expertCard) {
      expertCard.style.display = 'block';
    }

    statusEl.textContent =
      'Auto detection restored. This photo is eligible for Professional Retouch or Expert Manual Editing.';

    return true;
  }

  if (storedAutoDetect.status === 'REVIEW' && !storedAutoDetect.detection) {
    lockedDetection = storedAutoDetect.detection || null;
    lockedDetectionFingerprint =
      lockedDetection ? (currentPhotoFingerprint || '') : '';
    photoValidationPassed = false;
    autoDetectLocked = true;
    window.usvisaRecoverable = false;

    showValidationExpertOnly(
      storedAutoDetect.message ||
      'This source requires Expert Manual Editing.'
    );

    setDetectButtonState('warning');
    setCreateEnabled(false);

    if (createBtn) {
      createBtn.style.display = 'none';
    }

    if (professionalCard) {
      professionalCard.style.display = 'none';
    }

    if (professionalRetouchBtn) {
      professionalRetouchBtn.style.display = 'none';
    }

    if (expertCard) {
      expertCard.style.display = 'block';
    }

    statusEl.textContent =
      'Expert Manual Editing is required for this photo source.';

    return true;
  }

  if (storedAutoDetect.status === 'DENY') {
    lockedDetection = null;
    detectedLm = null;
    lockedDetectionFingerprint = '';
    photoValidationPassed = false;
    window.usvisaRecoverable = false;
    autoDetectLocked = true;
    setCreateEnabled(false);
    setDetectButtonState('deny');
    statusEl.textContent =
      'This photo was previously denied by Auto Detect. Please upload another photo.';
    return true;
  }

  return false;
}
  
let cachedContainRect = null;

function getContainRect(forceRefresh = false) {
  if (!forceRefresh && cachedContainRect) return cachedContainRect;

  const img = getCurrentImage();

  const zoneRect = zone.getBoundingClientRect();
  const previewRect = previewImg.getBoundingClientRect();

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  cachedContainRect = {
    left: previewRect.left - zoneRect.left,
    top: previewRect.top - zoneRect.top,
    dw: previewRect.width,
    dh: previewRect.height,
    scale: previewRect.width / iw,
    iw,
    ih
  };

  return cachedContainRect;
}
function lineTopPx(line) {
  return parseFloat(line.style.top || line.offsetTop || 0);
}

function setLineTop(line, y) {
  if (!getCurrentImage()) return;
  const rect = getContainRect();
  const clamped = Math.max(rect.top, Math.min(rect.top + rect.dh, y));
  line.style.top = clamped + 'px';
  guideMode = 'manual';

detectBtn.textContent = 'Manual';
detectBtn.style.background = '#f59e0b';
detectBtn.style.opacity = '1';
  
  statusEl.textContent = 'Guide lines adjusted. Click Auto Detect again or create after validation.';
}

function imageYFromLine(line) {
  const rect = getContainRect();
  return (lineTopPx(line) - rect.top) / rect.scale;
}

function imageYToScreen(y) {
  const rect = getContainRect(true);
  return rect.top + y * rect.scale;
}

function initGuideLines() {
  if (!getCurrentImage()) return;
  crownLine.style.display = 'none';
  chinLine.style.display = 'none';
}

function clearPaymentReturnParams() {
  try {
    const parentLocation = window.parent.location;
    const url = new URL(parentLocation.href);
    let changed = false;

    [
      'paid',
      'payment',
      'payment_error',
      'canceled',
      'orderId',
      'token',
      'PayerID',
      'product'
    ].forEach(function (key) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });

    if (changed) {
      window.parent.history.replaceState(
        {},
        '',
        url.pathname + url.search + url.hash
      );
    }
  } catch (error) {
    console.error('PAYMENT URL CLEANUP ERROR:', error);
  }
}

function clearConfirmedPaymentStates() {
  try {
    const keysToRemove = [];

    for (let i = 0; i < window.parent.localStorage.length; i += 1) {
      const key = window.parent.localStorage.key(i);

      if (
        key &&
        (
          key.indexOf(CONFIRMED_PAYMENT_PREFIX) === 0 ||
          key.indexOf(AUTO_DOWNLOAD_PREFIX) === 0
        )
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(function (key) {
      window.parent.localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('CONFIRMED PAYMENT CLEANUP ERROR:', error);
  }
}

function clearPaymentState() {
  window.parent.localStorage.removeItem('usvisa_clean_photo');
  window.parent.localStorage.removeItem('usvisa_download_count');
  window.parent.localStorage.removeItem('usvisa_pending_clean_photo');
  window.parent.localStorage.removeItem('usvisa_protected_preview');
  window.parent.localStorage.removeItem('usvisa_pending_international_photo');
  window.parent.localStorage.removeItem('usvisa_pending_professional_photo');
  window.parent.localStorage.removeItem('usvisa_pending_professional_international_photo');
  window.parent.localStorage.removeItem('usvisa_secure_basic_photo');
  window.parent.localStorage.removeItem('usvisa_secure_basic_extra_photo');
  window.parent.localStorage.removeItem('usvisa_secure_professional_photo');
    window.parent.localStorage.removeItem('usvisa_secure_professional_extra_photo');
    window.parent.localStorage.removeItem('usvisa_secure_professional_extra_photos');
  window.parent.localStorage.removeItem('usvisa_pending_professional_protected_preview');
  window.parent.localStorage.removeItem('usvisa_created_photo_files_fingerprint');
  window.parent.localStorage.removeItem('usvisa_pending_professional_photo_fingerprint');
  window.parent.localStorage.removeItem('usvisa_pending_professional_photo_version');
  window.parent.localStorage.removeItem('usvisa_created_photo_fingerprint');
  window.parent.localStorage.removeItem('usvisa_basic_output_version');
  window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
  window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
  clearConfirmedPaymentStates();
  clearPaymentReturnParams();
}

function readStoredPhoto(key) {
  return window.parent.localStorage.getItem(key) || '';
}

function readStoredProfessionalExtraPhotos() {
  const raw = readStoredPhoto(
    'usvisa_secure_professional_extra_photos'
  );

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(function(item) {
      return (
        item &&
        typeof item.sizeKey === 'string' &&
        isSecurePhotoToken(item.token)
      );
    });
  } catch (error) {
    console.error(
      'PROFESSIONAL EXTRA PHOTO STORAGE ERROR:',
      error
    );

    return [];
  }
}

function writeStoredPhoto(key, value) {
  if (value) {
    window.parent.localStorage.setItem(key, value);
  } else {
    window.parent.localStorage.removeItem(key);
  }
}

function markCreatedPhotoFilesForCurrentPhoto() {
  writeStoredPhoto(
    'usvisa_created_photo_files_fingerprint',
    currentPhotoFingerprint || ''
  );
}

function areCreatedPhotoFilesForCurrentPhoto() {
  if (!currentPhotoFingerprint) {
    return true;
  }

  const storedFingerprint = readStoredPhoto(
    'usvisa_created_photo_files_fingerprint'
  );

  if (storedFingerprint) {
    return storedFingerprint === currentPhotoFingerprint;
  }

  return isCreatedPhotoForFingerprint(currentPhotoFingerprint);
}

function getCleanPhotoForDownload() {
  if (!areCreatedPhotoFilesForCurrentPhoto()) {
    return '';
  }

  const storedCleanPhoto = readStoredPhoto('usvisa_clean_photo');

  if (isFinalJpegPhoto(storedCleanPhoto)) {
    return storedCleanPhoto;
  }

  if (
    resultUrl &&
    typeof resultUrl === 'string' &&
    resultUrl.indexOf('data:image/jpeg') === 0
  ) {
    return resultUrl;
  }

  return '';
}

function isFinalJpegPhoto(photoUrl) {
  return (
    typeof photoUrl === 'string' &&
    photoUrl.indexOf('data:image/jpeg') === 0
  );
}

function isSecurePhotoToken(value) {
  return typeof value === 'string' && value.indexOf('v1.') === 0;
}

function getSecurePhotoTokens(product) {
  const basic =
    readStoredPhoto(
      'usvisa_secure_basic_photo'
    );

  const basicExtra =
    readStoredPhoto(
      'usvisa_secure_basic_extra_photo'
    );

  const professional =
    readStoredPhoto(
      'usvisa_secure_professional_photo'
    );

  const professionalExtraPhotos =
    readStoredProfessionalExtraPhotos();

  const professionalExtraTokens =
    professionalExtraPhotos.map(
      function(item) {
        return item.token;
      }
    );

  if (product === 'basic') {
    return [
      basic
    ].filter(isSecurePhotoToken);
  }

  if (product === 'basic-international') {
    return [
      basic,
      basicExtra
    ].filter(isSecurePhotoToken);
  }

  /*
   * E.R.U always includes:
   * 1. validated prepared photo
   * 2. Embassy-Ready photo
   */
  if (product === 'professional') {
    return [
      basic,
      professional
    ].filter(isSecurePhotoToken);
  }

  /*
   * E.R.U + optional sizes:
   * prepared photo
   * Embassy-Ready default photo
   * every selected extra size
   */
  if (
    product ===
    'professional-international'
  ) {
    return [
      basic,
      professional,
      ...professionalExtraTokens
    ].filter(isSecurePhotoToken);
  }

  return [];
}

async function protectPhotoForCheckout(photoUrl) {
  if (!isFinalJpegPhoto(photoUrl)) throw new Error('A final JPEG is required.');
  const blob = await fetch(photoUrl).then(function(response) { return response.blob(); });
  const formData = new FormData();
  formData.append('image', blob, 'protected-photo.jpg');
  const response = await fetch('/api/secure-photo', { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok || !isSecurePhotoToken(data && data.token) || !data.preview) {
    throw new Error((data && data.error) || 'Photo protection failed.');
  }
  return data;
}

function getPaymentReturnFromUrl() {
  const searchParams = new URLSearchParams(
    window.parent.location.search
  );

  const orderId = searchParams.get('orderId') || '';
  const product = searchParams.get('product') || 'basic';

  if (
    searchParams.get('paid') !== '1' ||
    !orderId ||
    !isDownloadProduct(product)
  ) {
    return null;
  }

  return {
    orderId: orderId,
    product: product
  };
}

function getPaymentInterruptionFromUrl() {
  const searchParams = new URLSearchParams(
    window.parent.location.search
  );

  if (searchParams.get('canceled') === '1') {
    return {
      type: 'canceled',
      message:
        'Payment was canceled. Your preview is still ready if you want to checkout again.'
    };
  }

  const paymentError = searchParams.get('payment_error') || '';

  if (paymentError) {
    return {
      type: 'error',
      message:
        'Payment could not be completed. Please open checkout again when you are ready.'
    };
  }

  return null;
}

function getActivePaymentReturnState() {
  try {
    const raw = window.parent.localStorage.getItem(
      ACTIVE_PAYMENT_RETURN_KEY
    );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed && parsed.savedAt);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !savedAt ||
      Date.now() - savedAt > PENDING_PAYMENT_TTL_MS ||
      !parsed.orderId ||
      !isDownloadProduct(parsed.product) ||
      !isPaymentStateForCurrentPhoto(
        parsed,
        parsed.orderId,
        parsed.product
      )
    ) {
      window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
      return null;
    }

    return {
      orderId: parsed.orderId,
      product: parsed.product
    };
  } catch (error) {
    console.error('ACTIVE PAYMENT RETURN READ ERROR:', error);
    return null;
  }
}

function saveActivePaymentReturnState(paymentReturn) {
  if (
    !paymentReturn ||
    !paymentReturn.orderId ||
    !isDownloadProduct(paymentReturn.product)
  ) {
    window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
    return false;
  }

  const confirmedPayment = getConfirmedPaymentState(
    paymentReturn.orderId,
    paymentReturn.product
  );
  const activeFingerprint =
    (confirmedPayment && confirmedPayment.fingerprint) ||
    getCreatedPhotoFingerprint() ||
    readStoredPhoto('usvisa_created_photo_files_fingerprint') ||
    currentPhotoFingerprint ||
    '';

  if (!activeFingerprint) {
    window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
    return false;
  }

  window.parent.localStorage.setItem(
    ACTIVE_PAYMENT_RETURN_KEY,
    JSON.stringify({
      orderId: paymentReturn.orderId,
      product: paymentReturn.product,
      fingerprint: activeFingerprint,
      savedAt: Date.now()
    })
  );

  return true;
}

function clearActivePaymentReturnState() {
  window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
  clearPaymentReturnParams();
}

function clearInterruptedPaymentState() {
  window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
  window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
  clearPaymentReturnParams();
}

function beginCheckoutForProduct(product) {
  if (!isDownloadProduct(product)) {
    return false;
  }

  window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
  clearActivePaymentReturnState();
  return true;
}

function getCurrentPaidReturnState() {
  const urlPaymentReturn = getPaymentReturnFromUrl();

  if (urlPaymentReturn) {
    if (
      hasMatchingPaymentAccess(
        urlPaymentReturn.orderId,
        urlPaymentReturn.product
      )
    ) {
      saveActivePaymentReturnState(urlPaymentReturn);
      return urlPaymentReturn;
    }

    window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
    return null;
  }

  const activePaymentReturn = getActivePaymentReturnState();

  if (
    activePaymentReturn &&
    hasMatchingPaymentAccess(
      activePaymentReturn.orderId,
      activePaymentReturn.product
    )
  ) {
    return activePaymentReturn;
  }

  window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
  return null;
}

function getCurrentPaidDownloadKey() {
  const paymentReturn = getCurrentPaidReturnState();

  if (!paymentReturn) {
    return '';
  }

  return [
    'usvisa_download_count',
    encodeURIComponent(paymentReturn.orderId),
    encodeURIComponent(paymentReturn.product)
  ].join(':');
}

function getCurrentPaidAutoDownloadKey() {
  const paymentReturn = getCurrentPaidReturnState();

  if (!paymentReturn) {
    return '';
  }

  return [
    AUTO_DOWNLOAD_PREFIX,
    encodeURIComponent(paymentReturn.orderId),
    ':',
    encodeURIComponent(paymentReturn.product)
  ].join('');
}

function hasAutoDownloadedForCurrentPaidReturn() {
  const key = getCurrentPaidAutoDownloadKey();

  return !!key && window.parent.localStorage.getItem(key) === '1';
}

function markAutoDownloadedForCurrentPaidReturn() {
  const key = getCurrentPaidAutoDownloadKey();

  if (key) {
    window.parent.localStorage.setItem(key, '1');
  }
}

function resetDownloadUiForDraftPhoto() {
  if (downloadBtn) {
    downloadBtn.dataset.downloadCount = '0';
    downloadBtn.style.display = 'none';
    setDownloadEnabled(false);
  }

  if (statusEl) {
    statusEl.textContent = 'Upload a photo, then run Auto Detect.';
  }
}

function getPendingPaymentState() {
  try {
    const raw =
      window.parent.localStorage.getItem(PENDING_PAYMENT_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('PENDING PAYMENT READ ERROR:', error);
    return null;
  }
}

function getPaymentAccessKey(orderId, product) {
  if (!orderId || !isDownloadProduct(product)) {
    return '';
  }

  return [
    CONFIRMED_PAYMENT_PREFIX,
    encodeURIComponent(orderId),
    ':',
    encodeURIComponent(product)
  ].join('');
}

function getConfirmedPaymentState(orderId, product) {
  const key = getPaymentAccessKey(orderId, product);

  if (!key) {
    return null;
  }

  try {
    const raw = window.parent.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('CONFIRMED PAYMENT READ ERROR:', error);
    return null;
  }
}

function saveConfirmedPaymentState(paymentState) {
  if (
    !paymentState ||
    !paymentState.orderId ||
    !isDownloadProduct(paymentState.product) ||
    !paymentState.fingerprint
  ) {
    return false;
  }

  const key = getPaymentAccessKey(
    paymentState.orderId,
    paymentState.product
  );

  if (!key) {
    return false;
  }

  window.parent.localStorage.setItem(
    key,
    JSON.stringify({
      orderId: paymentState.orderId,
      product: paymentState.product,
      fingerprint: paymentState.fingerprint,
      confirmedAt: Date.now()
    })
  );

  return true;
}

function isFreshPendingPayment(paymentState) {
  if (!paymentState || !paymentState.createdAt) {
    return false;
  }

  return Date.now() - Number(paymentState.createdAt) <=
    PENDING_PAYMENT_TTL_MS;
}

function isPaymentStateForCurrentPhoto(paymentState, orderId, product) {
  if (
    !paymentState ||
    paymentState.orderId !== orderId ||
    paymentState.product !== product ||
    !paymentState.fingerprint
  ) {
    return false;
  }

  if (
    currentPhotoFingerprint &&
    paymentState.fingerprint !== currentPhotoFingerprint
  ) {
    return false;
  }

  const filesFingerprint = readStoredPhoto(
    'usvisa_created_photo_files_fingerprint'
  );

  if (
    filesFingerprint &&
    paymentState.fingerprint !== filesFingerprint
  ) {
    return false;
  }

  const createdFingerprint = getCreatedPhotoFingerprint();

  if (
    createdFingerprint &&
    paymentState.fingerprint !== createdFingerprint
  ) {
    return false;
  }

  return true;
}

function getOrderIdFromCheckoutUrl(checkoutUrl) {
  try {
    const url = new URL(checkoutUrl);

    return (
      url.searchParams.get('token') ||
      url.searchParams.get('orderId') ||
      ''
    );
  } catch {
    return '';
  }
}

function rememberPendingPayment(product, checkoutUrl) {
  const orderId = getOrderIdFromCheckoutUrl(checkoutUrl);

  if (!orderId || !isDownloadProduct(product)) {
    window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
    return false;
  }

  const fingerprint =
    currentPhotoFingerprint ||
    readStoredPhoto('usvisa_created_photo_files_fingerprint') ||
    getCreatedPhotoFingerprint();

  if (!fingerprint) {
    window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
    return false;
  }

  window.parent.localStorage.setItem(
    PENDING_PAYMENT_KEY,
    JSON.stringify({
      orderId: orderId,
      product: product,
      fingerprint: fingerprint,
      createdAt: Date.now()
    })
  );

  return true;
}

function hasMatchingPaymentAccess(orderId, product) {
  const confirmedPayment =
    getConfirmedPaymentState(orderId, product);

  if (
    isPaymentStateForCurrentPhoto(
      confirmedPayment,
      orderId,
      product
    )
  ) {
    return true;
  }

  const pendingPayment = getPendingPaymentState();

  if (
    !isFreshPendingPayment(pendingPayment) ||
    !isPaymentStateForCurrentPhoto(
      pendingPayment,
      orderId,
      product
    )
  ) {
    window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
    return false;
  }

  saveConfirmedPaymentState(pendingPayment);
  window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);

  return true;
}

function getCurrentPaidProduct() {
  const paymentReturn = getCurrentPaidReturnState();
  const product = paymentReturn ? paymentReturn.product : '';

  return isDownloadProduct(product)
    ? product
    : 'unsupported';
}

function hasValidPaidReturn() {
  return !!getCurrentPaidReturnState();
}

function isDownloadProduct(product) {
  return [
    'basic',
    'basic-international',
    'professional',
    'professional-international'
  ].indexOf(product) !== -1;
}

function getPurchasedFileLabels(product) {
  switch (product) {
    case 'basic-international':
      return [
        'HD U.S. Visa Photo',
        'International 3.5 × 4.5 cm Photo'
      ];
   case 'professional':
  return window.usvisaRecoverable === true
    ? [
        'Embassy-Ready Photo'
      ]
    : [
        'Validated Prepared Photo',
        'Embassy-Ready Photo'
      ];

case 'professional-international': {
  const extraPhotos =
    readStoredProfessionalExtraPhotos();

  const extraLabels =
    extraPhotos.map(function(item) {
      const spec =
        ADDITIONAL_DOWNLOAD_SPECS[item.sizeKey];

      return spec
        ? 'Embassy-Ready ' + spec.label
        : 'Embassy-Ready Additional Photo';
    });

  return window.usvisaRecoverable === true
    ? [
        'Embassy-Ready Photo',
        ...extraLabels
      ]
    : [
        'Validated Prepared Photo',
        'Embassy-Ready Photo',
        ...extraLabels
      ];
}
    case 'basic':
      return [
        'HD U.S. Visa Photo'
      ];
    default:
      return [
        'Purchased photo file'
      ];
  }
}

function getPaidDownloadFilename(fileType) {
  const extraLabels = { '35x45':'35x45mm', '2x2':'2x2inch', '30x40':'30x40mm', '20x30':'20x30mm', '40x60':'40x60mm' };
  switch (fileType) {
    case 'basic-us':
      return 'usvisaphoto_us_visa_2x2.jpg';
    case 'basic-international':
      return 'usvisaphoto_extra_' + (extraLabels[readStoredPhoto('usvisa_pending_extra_size_key')] || 'size') + '.jpg';
    case 'professional-us':
      return 'usvisaphoto_professional_us_visa_2x2.jpg';
    case 'professional-international':
      return 'usvisaphoto_professional_extra_' + (extraLabels[readStoredPhoto('usvisa_pending_professional_extra_size_key')] || 'size') + '.jpg';
    default:
      return 'usvisaphoto_photo.jpg';
  }
}

function getPaidDownloadFiles(product) {
  if (!isDownloadProduct(product)) {
    return getPurchasedFileLabels(product).map(function (label) {
      return {
        url: '',
        filename: '',
        label: label
      };
    });
  }

  if (!areCreatedPhotoFilesForCurrentPhoto()) {
    return getPurchasedFileLabels(product).map(function (label) {
      return {
        url: '',
        filename: '',
        label: label
      };
    });
  }

  const cleanPhoto = readStoredPhoto('usvisa_secure_basic_photo');
  const internationalPhoto =
    readStoredPhoto('usvisa_secure_basic_extra_photo');
  const professionalPhoto =
    readStoredPhoto('usvisa_secure_professional_photo');
  const professionalInternationalPhoto =
    readStoredPhoto('usvisa_secure_professional_extra_photo');

  switch (product) {
    case 'basic-international':
      return [
        {
          url: cleanPhoto,
          filename: getPaidDownloadFilename('basic-us'),
          label: 'HD U.S. Visa Photo'
        },
        {
          url: internationalPhoto,
          filename: getPaidDownloadFilename('basic-international'),
          label: 'International 3.5 × 4.5 cm Photo'
        }
      ];
case 'professional': {
  const professionalFiles = [
    {
      url: professionalPhoto,
      filename: getPaidDownloadFilename('professional-us'),
      label: 'Embassy-Ready U.S. Visa Photo'
    }
  ];

  if (window.usvisaRecoverable === true) {
    return professionalFiles;
  }

  return [
    {
      url: cleanPhoto,
      filename: getPaidDownloadFilename('basic-us'),
      label: 'Validated Prepared Photo'
    },
    ...professionalFiles
  ];
}

case 'professional-international': {
  const extraPhotos =
    readStoredProfessionalExtraPhotos();

  const professionalFiles = [
    {
      url: professionalPhoto,
      filename: getPaidDownloadFilename('professional-us'),
      label: 'Embassy-Ready U.S. Visa Photo'
    },

    ...extraPhotos.map(function(item) {
      const spec =
        ADDITIONAL_DOWNLOAD_SPECS[item.sizeKey];

      return {
        url: item.token,

        filename:
          'usvisaphoto_embassy_ready_' +
          item.sizeKey +
          '.jpg',

        label:
          spec
            ? 'Embassy-Ready ' + spec.label
            : 'Embassy-Ready Additional Photo'
      };
    })
  ];

  if (window.usvisaRecoverable === true) {
    return professionalFiles;
  }

  return [
    {
      url: cleanPhoto,
      filename: getPaidDownloadFilename('basic-us'),
      label: 'Validated Prepared Photo'
    },
    ...professionalFiles
  ];
}
}
}

function getMissingPaidDownloadLabels(product) {
  return getPaidDownloadFiles(product)
    .filter(function (file) {
      return !isSecurePhotoToken(file.url);
    })
    .map(function (file) {
      return file.label;
    });
}

function hasAllPaidDownloadFiles(product) {
  return getMissingPaidDownloadLabels(product).length === 0;
}

function getPaidDownloadCount() {
  const key = getCurrentPaidDownloadKey();

  if (!key) {
    return 0;
  }

  return Number(
    window.parent.localStorage.getItem(key) ||
    '0'
  );
}

function setPaidDownloadCount(downloadCount) {
  const normalizedCount = Math.max(
    0,
    Math.floor(Number(downloadCount) || 0)
  );

  const key = getCurrentPaidDownloadKey();

  downloadBtn.dataset.downloadCount = String(normalizedCount);

  if (key) {
    window.parent.localStorage.setItem(
      key,
      String(normalizedCount)
    );
  }

  setPhotoDownloadCount(normalizedCount);

  return normalizedCount;
}

function getRemainingPaidDownloads(downloadCount) {
  return Math.max(
    0,
    MAX_PAID_DOWNLOADS -
      Math.max(0, Math.floor(Number(downloadCount) || 0))
  );
}

function getDownloadAttemptLabel(count) {
  return count === 1 ? 'download' : 'downloads';
}

function updatePaidDownloadButton(downloadCount, product) {
  if (!downloadBtn) return;

  const paidProduct = product || getCurrentPaidProduct();

  if (!hasAllPaidDownloadFiles(paidProduct)) {
    downloadBtn.textContent = 'Photo files not ready';
    setDownloadEnabled(false);
    return;
  }

  const remainingDownloads =
    getRemainingPaidDownloads(downloadCount);

  if (remainingDownloads <= 0) {
    downloadBtn.textContent = 'Download limit reached';
    setDownloadEnabled(false);
    return;
  }

  const remainingLabel =
    remainingDownloads + ' ' +
    getDownloadAttemptLabel(remainingDownloads) +
    ' left';

  downloadBtn.textContent =
    downloadCount > 0
      ? '⬇ Download Photos Again · ' + remainingLabel
      : '⬇ Download Photos · ' + remainingLabel;
  setDownloadEnabled(true);
}

function getPaidSuccessMessage(product, downloadCount) {
  const missingLabels = getMissingPaidDownloadLabels(product);

  if (missingLabels.length) {
    return (
      '<div style="line-height:1.7">' +
      '<b>Payment confirmed.</b><br><br>' +
      'We could not find these prepared file(s):<br>' +
      missingLabels
        .map(function (label) {
          return '• ' + label;
        })
        .join('<br>') +
      '<br><br>Please create the preview again for this photo.' +
      '</div>'
    );
  }

  const labels = getPurchasedFileLabels(product)
    .map(function (label) {
      return '✓ ' + label + ' Ready';
    })
    .join('<br>');

  const remainingDownloads =
    getRemainingPaidDownloads(downloadCount);

  return (
    '<div style="line-height:1.7">' +
    '<b>✅ Payment Successful!</b><br><br>' +
    labels +
    '<br><br>' +
    'Each click downloads your purchased file set once.<br>' +
    'Remaining downloads: <b>' +
    remainingDownloads +
    '</b> of ' +
    MAX_PAID_DOWNLOADS +
    '.' +
    '</div>'
  );
}

function triggerPhotoDownload(photoUrl, filename) {
  if (!photoUrl) {
    return false;
  }

  const link = document.createElement('a');
  link.href = photoUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return true;
}

function triggerPhotoDownloads(files) {
  let queuedCount = 0;

  files.forEach(function (file) {
    if (
      !file ||
      !isFinalJpegPhoto(file.url) ||
      !file.filename ||
      file.filename.slice(-4).toLowerCase() !== '.jpg'
    ) {
      return;
    }

    const delay = queuedCount * 500;

    setTimeout(function () {
      triggerPhotoDownload(file.url, file.filename);
    }, delay);

    queuedCount += 1;
  });

  return queuedCount;
}

function isStoredProfessionalForCurrentPhoto() {
  if (!currentPhotoFingerprint) {
    return true;
  }

  const storedFingerprint =
    readStoredPhoto('usvisa_pending_professional_photo_fingerprint');

  const storedVersion =
    readStoredPhoto('usvisa_pending_professional_photo_version');

  return (
    storedFingerprint === currentPhotoFingerprint &&
    storedVersion === PROFESSIONAL_PREVIEW_VERSION
  );
}

let currentPhotoFingerprint = '';

async function createPhotoFingerprint(file) {
  const fileBuffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    fileBuffer
  );

  const hash = Array.from(
    new Uint8Array(hashBuffer)
  )
    .map(function (byte) {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');

  return [
    hash,
    file.size,
    file.type || 'unknown'
  ].join(':');
}
function restorePreviouslyCreatedPhoto() {
  if (
    readStoredPhoto('usvisa_basic_output_version') !==
    BASIC_OUTPUT_VERSION
  ) {
    clearPaymentState();
    return false;
  }
  if (
    currentPhotoFingerprint &&
    !isCreatedPhotoForFingerprint(currentPhotoFingerprint)
  ) {
    clearPaymentState();
    return false;
  }

  const savedCleanPhoto =
    window.parent.localStorage.getItem(
      'usvisa_clean_photo'
    );

  const savedProtectedPreview =
    window.parent.localStorage.getItem(
      'usvisa_protected_preview'
    );

  if (!savedProtectedPreview) {
    return false;
  }

  if (!areCreatedPhotoFilesForCurrentPhoto()) {
    clearPaymentState();
    return false;
  }

  resultUrl = savedCleanPhoto || savedProtectedPreview;

  if (!canvas) {
    console.error(
      'RESTORE ERROR: result canvas not found.'
    );
    return false;
  }

  canvas.width = TARGET;
  canvas.height = TARGET_HEIGHT;
  canvas.style.display = 'block';

  if (resultPanel) {
    resultPanel.style.display = 'block';
  }

  if (previewImg) {
    previewImg.style.display = 'none';
  }

  if (placeholder) {
    placeholder.style.display = 'none';
  }

  const restoredImage = new Image();

  restoredImage.onload = function () {
    const restoredCtx =
      canvas.getContext('2d');

    if (!restoredCtx) {
      console.error(
        'RESTORE ERROR: canvas context unavailable.'
      );
      return;
    }

    restoredCtx.clearRect(
      0,
      0,
      TARGET,
      TARGET
    );

    restoredCtx.drawImage(
      restoredImage,
      0,
      0,
      TARGET,
      TARGET
    );

  };

  restoredImage.onerror = function (error) {
    console.error(
      'RESTORE IMAGE LOAD ERROR:',
      error
    );
  };

  restoredImage.src =
    savedProtectedPreview;

  setCreateEnabled(false);
  createBtn.disabled = true;
  createBtn.textContent =
    '✔ Preview Restored';

  if (downloadBtn && (savedCleanPhoto || isSecurePhotoToken(readStoredPhoto('usvisa_secure_basic_photo')))) {
    downloadBtn.style.display = 'block';
    setDownloadEnabled(true);
    updateBasicPackageButton();
  }

  statusEl.textContent =
    'Your previously created photo has been restored. You can continue to checkout.';

  return true;
}
  
function createProtectedProfessionalPreview(src) {
  return new Promise(function (resolve, reject) {
    const img = new Image();

    img.onload = function () {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = TARGET;
      previewCanvas.height = TARGET_HEIGHT;

      const pctx = previewCanvas.getContext('2d');

      pctx.drawImage(img, 0, 0, TARGET, TARGET_HEIGHT);

      // Use exactly the same watermark and measurement renderer as Basic.
      applyPreviewProtection(pctx, TARGET, TARGET_HEIGHT);
      drawOverlayGuide(pctx, TARGET, TARGET_HEIGHT);

const badgeW = 180;
const badgeH = 58;
const badgeX = 12;
const badgeY = 12;

pctx.save();

pctx.fillStyle = '#14866d';
pctx.beginPath();
pctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
pctx.fill();

pctx.fillStyle = '#ffffff';
pctx.textAlign = 'left';
pctx.font = 'bold 18px Arial';
pctx.fillText('Embassy-Ready', badgeX + 14, badgeY + 24);

pctx.font = '13px Arial';
pctx.fillText('2 × 2 inch · 300 DPI', badgeX + 14, badgeY + 44);

pctx.restore();

      resolve(previewCanvas.toDataURL('image/png'));
    };

    img.onerror = reject;
    img.src = src;
  });
}
function resetForNewUpload() {
  setBasicPhotoSectionVisible(true);
  if (eruProgress) eruProgress.hidden = true;
  if (eruProgressBar) eruProgressBar.style.width = '0%';

  professionalPreviewLocked = false;
  professionalRetouchBusy = false;
  autoDetectLocked = false;

  currentPhotoFingerprint = '';
  uploadedFile = null;
  uploadedImg = null;
  bgRemovedImg = null;
  detectedLm = null;
  lockedDetection = null;
  lockedDetectionFingerprint = '';
  resultUrl = null;
  faceTiltAngle = 0;
  autoDetectLocked = false;
  guideMode = 'auto';
  photoValidationPassed = false;
  window.usvisaRecoverable = false;
  window.usvisaGlassesRemovalRequired = false;
  window.usvisaLastValidationReport = null;
  window.usvisaLastValidationResult = null;
  setDetectButtonState('auto');

  showCreatePhotoButton();
  setCreateEnabled(false);
  resetDownloadUiForDraftPhoto();
  resetValidationUI();
  createBtn.textContent = 'Create Photo';
  updateBasicPackageButton();
  resetDownloadUiForDraftPhoto();
  canvas.style.display = 'none';
  if (resultPanel) resultPanel.style.display = 'none';
  if (uploadTips) uploadTips.style.display = 'block';
  crownLine.style.display = 'none';
  chinLine.style.display = 'none';
  previewImg.style.display = 'none';
  previewImg.src = '';
  placeholder.style.display = 'flex';

  if (retouchImage) {
    retouchImage.removeAttribute('src');
    retouchImage.style.display = 'none';
  }

  if (retouchPreview) {
    retouchPreview.style.display = 'none';
    retouchPreview.classList.remove('is-visible');
}

  if (professionalCard) {
    professionalCard.style.display = 'none';
  }

  if (premiumCreateBtn) {
    premiumCreateBtn.style.display = 'none';
    premiumCreateBtn.disabled = true;
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.style.display = '';
    applyProfessionalPreviewDailyState();
  }
}

fileInput.addEventListener('change', async function(e) {
  const file = e.target.files && e.target.files[0];

  if (!file) {
    return;
  }

  resetForNewUpload();
  uploadedFile = file;

  try {
  currentPhotoFingerprint =
    (await createPhotoFingerprint(file)) + ':' + COUNTRY_CODE;

  professionalPreviewLocked = false;
  professionalRetouchBusy = false;

  if (professionalRetouchBtn) {
    professionalRetouchBtn.disabled = false;
  }

  applyProfessionalPreviewDailyState();

    const photoState = getPhotoState();

    const isPreviouslyCreatedPhoto =
      photoState.fingerprint === currentPhotoFingerprint &&
      photoState.created === true;

    if (isPreviouslyCreatedPhoto) {
      const restored =
        restorePreviouslyCreatedPhoto();

      if (restored) {
        return;
      }

      setCreateEnabled(false);
      createBtn.disabled = true;
      createBtn.textContent =
        '✔ Photo Already Created';

      statusEl.textContent =
        'The saved preview could not be restored.';

      return;
    }

    clearPaymentState();

    setCreateEnabled(false);
    createBtn.textContent = 'Create Photo';

    statusEl.textContent =
      'Photo uploaded. Click Auto Detect.';
  } catch (error) {
    console.error(
      'PHOTO FINGERPRINT ERROR:',
      error
    );

    currentPhotoFingerprint = '';
    clearPaymentState();

    setCreateEnabled(false);
    createBtn.textContent = 'Create Photo';

    statusEl.textContent =
      'Photo uploaded. Click Auto Detect.';
  }

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = function() {
    uploadedImg = img;
    fileInput.classList.add('disabled-upload');
    previewImg.src = url;
    previewImg.style.display = 'block';
    if (expertCard) {
  expertCard.style.display = 'block';
}
    previewImg.style.visibility = 'visible';
    previewImg.style.opacity = '1';
    placeholder.style.display = 'none';
    setTimeout(function () {
  cachedContainRect = null;
  initGuideLines();

  restoreStoredAutoDetectResult();
}, 100);
  };

  img.onerror = function() {
    statusEl.textContent = 'Image preview failed. Please try another photo.';
  };

  img.src = url;
});

newPhotoBtn.addEventListener('click', function() {
  fileInput.classList.remove('disabled-upload');
  fileInput.value = '';
  fileInput.click();
});

[crownLine, chinLine].forEach(function(line) {
  line.addEventListener('mousedown', function(e) {
    e.preventDefault();
    draggingLine = line;
  });
  line.addEventListener('touchstart', function(e) {
    e.preventDefault();
    draggingLine = line;
  }, { passive: false });
});

window.addEventListener('mousemove', function(e) {
  if (!draggingLine || !getCurrentImage()) return;
  const rect = zone.getBoundingClientRect();
  setLineTop(draggingLine, e.clientY - rect.top);
});

window.addEventListener('mouseup', function() {
  draggingLine = null;
});

window.addEventListener('touchmove', function(e) {
  if (!draggingLine || !getCurrentImage()) return;
  e.preventDefault();
  const rect = zone.getBoundingClientRect();
  setLineTop(draggingLine, e.touches[0].clientY - rect.top);
}, { passive: false });

window.addEventListener('touchend', function() {
  draggingLine = null;
});

async function initFaceMesh() {
  if (faceMesh) return faceMesh;

  faceMesh = new FaceMesh({
    locateFile: function(file) {
      return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + file;
    }
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  return faceMesh;
}



function validateDetectedPhoto(lm, iw, ih, sourceImage) {
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className = 'validation-card';
  }

  if (checkFace) checkFace.textContent = '🟢 Face detected';

console.log(
    "SOURCE IMAGE PASSED TO VALIDATION",
    sourceImage
);
  
console.log("CURRENT LM", {
  noseX: lm[1].x,
  noseY: lm[1].y,
  leftEye: lm[33].x,
  rightEye: lm[263].x,
  imageWidth: iw,
  imageHeight: ih
});

  const validation = evaluateDetectedPhoto(
  lm,
  iw,
  ih,
  sourceImage
);

// Eyewear is a blocking/review rule only for destinations that explicitly
// use it in this product: United States, India, and China.
if (!GLASSES_RULE_ENABLED) {
  if (validation.failureReason === 'glasses' || validation.failureReason === 'glassesReview') {
    validation.pass = true;
    validation.failureReason = null;
  } else if (validation.failureReason === 'glassesAndTeeth') {
    validation.pass = false;
    validation.failureReason = 'mouthOpen';
  }
  validation.glassesDetected = false;
  if (validation.appearance) validation.appearance.glassesDetected = false;
}

window.usvisaLastValidationResult =
  validation;

 const eyesClosed =
  validation.eyeResult.eyesClosed;

const mouthOpenDetected =
  Boolean(
    validation.mouthResult.mouthOpened
  );

const teethVisibleDetected =
  Boolean(
    validation.mouthResult.teethVisible
  );

const mouthInvalid =
  mouthOpenDetected ||
  teethVisibleDetected;
  
  if (checkEyes) {
    checkEyes.textContent = eyesClosed ? '🔴 Eyes may be closed' : '🟢 Eyes open';
  }
if (checkMouth) {
  if (teethVisibleDetected) {
    checkMouth.textContent =
      '🔴 Teeth must not be visible';
  } else if (mouthOpenDetected) {
    checkMouth.textContent =
      '🔴 Mouth should be closed';
  } else {
    checkMouth.textContent =
      '🟢 Mouth closed';
  }
}
 if (checkGlasses && GLASSES_RULE_ENABLED) {
  const glassesDetected =
    validation.failureReason === 'glasses' ||
    validation.failureReason === 'glassesAndTeeth' ||
    validation.failureReason === 'glassesReview';

  window.usvisaEyewearDetected = glassesDetected;
  
  checkGlasses.textContent =
    glassesDetected
      ? '🟠 Eyeglasses detected — Embassy-Ready Upgrade recommended'
      : '🟢 No glasses detected';
} else if (checkGlasses) {
  checkGlasses.textContent = '';
  checkGlasses.style.display = 'none';
}

  if (checkPosition) {
  const positionFailed =
    validation.failureReason === 'hat' ||
    validation.failureReason === 'direction';

  checkPosition.textContent = positionFailed
    ? '🔴 Head position / hat check failed'
    : '🟢 Head position and hat check passed';
}
  if (!validation.pass) {
    if (validation.failureReason === 'eyesClosed') {
      showValidationError(
        '❌ Eyes may be closed.<br>Please upload another photo with both eyes open.'
      );
      return false;
    }

    if (validation.failureReason === 'glassesAndTeeth') {
      validation.failureReason = 'glassesReview';
      window.usvisaGlassesReview = validation;
      return validation;
    }

if (validation.failureReason === 'glasses') {
  showValidationError(
    '❌ Glasses are not allowed.<br>Please upload a photo without glasses.'
  );
  return false;
}

if (validation.failureReason === 'glassesReview') {
  window.usvisaGlassesReview = validation;
  return validation;
}

   if (validation.failureReason === 'mouthOpen') {
  showValidationError(
    '❌ Teeth must not be visible.<br>Please keep your mouth closed with a neutral expression.'
  );
  return false;
}

    if (validation.failureReason === 'hat') {
      showValidationError(
        'Hat or head covering detected.<br>Please upload a photo without hats or head coverings.'
      );
      return false;
    }

    if (validation.failureReason === 'direction') {
      showValidationError(
        'Face is not straight.<br>Please look directly at the camera with your head facing forward.'
      );
      return false;
    }

    if (
  validation.failureReason === 'upperBodyTight' ||
  validation.failureReason === 'professionalRecoverable' ||
  validation.failureReason === 'alreadyCropped'
) {
  setDetectButtonState('warning');

  showValidationRecoverable(
    'This photo needs more composition space for standard preparation.<br><br>' +
    'Professional Retouch can extend the clothing and shoulder area automatically.'
  );

  return false;
}

showValidationError(
  'This photo requires manual review.<br>Please use Expert Manual Editing.'
);
return false;
  }

  window.usvisaLastValidationReport = {
    score: validation.score,
    headSizeText: validation.report.headSizeText,
    centerText: validation.report.centerText,
    originalText: validation.report.originalText,
    metrics: validation.report.metrics
  };

  return validation;
}
detectBtn.addEventListener('click', async function(e) {
  e.preventDefault();

// REVIEW 상태: 한 번만 실행하고 E.R.U 영역으로 이동
if (detectBtn.textContent?.includes('REVIEW')) {
  if (resultPanel) {
    resultPanel.style.display = 'block';
  }

  if (professionalCard) {
    professionalCard.style.display = 'block';

    requestAnimationFrame(() => {
      professionalCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  // REVIEW는 이미 완료됐으므로 버튼 제거
  detectBtn.style.display = 'none';

  return;
}

  if (restoreStoredAutoDetectResult()) {
    return;
  }

  if (autoDetectLocked) {
    statusEl.innerHTML =
      '✅ Auto detection has already been completed for this photo.<br>Please create the photo or choose another photo.';
    return;
  }

  const img = getCurrentImage();

  if (!img) {
    statusEl.textContent = 'Please upload a photo first.';
    setCreateEnabled(false);
    return;
  }

  if (!img) {
    statusEl.textContent = 'Please upload a photo first.';
    setCreateEnabled(false);
    return;
  }

  const sourceCheckPromise = (async () => {
    const sourceForm = new FormData();
    sourceForm.append('image', uploadedFile);

    try {
      const sourceResponse = await fetch('/api/source-photo-check', {
        method: 'POST',
        body: sourceForm
      });

      if (!sourceResponse.ok) {
        console.error(
          'SOURCE PHOTO CHECK ERROR:',
          await sourceResponse.text()
        );

        return 'UNCERTAIN';
      }

      const sourceResult = await sourceResponse.json();

      const validSourceTypes = [
        'DIGITAL',
        'PRINTED_PHOTO',
        'PHOTO_OF_PHOTO',
        'SCREEN_CAPTURE',
        'UNCERTAIN'
      ];

      return validSourceTypes.includes(sourceResult?.source)
        ? sourceResult.source
        : 'UNCERTAIN';
    } catch (sourceError) {
      console.error('SOURCE PHOTO CHECK ERROR:', sourceError);
      return 'UNCERTAIN';
    }
  })();

  clearCreatedPhotoState(currentPhotoFingerprint);


  clearCreatedPhotoState(currentPhotoFingerprint);
  clearPaymentState();
  lockedDetection = null;
  detectedLm = null;
  lockedDetectionFingerprint = '';
  photoValidationPassed = false;
  window.usvisaRecoverable = false;
  window.usvisaLastValidationReport = null;
  window.usvisaLastValidationResult = null;
  resultUrl = null;
  setDownloadEnabled(false);
  if (downloadBtn) {
    downloadBtn.style.display = 'none';
  }

  setCreateEnabled(false);
  autoDetectLocked = true;
  setDetectButtonState('success');
  statusEl.textContent = 'Detecting face...';

  try {
    const fm = await initFaceMesh();

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const tempCanvas = document.createElement('canvas');
tempCanvas.width = iw;
tempCanvas.height = ih;

const tempCtx = tempCanvas.getContext('2d');

if (!tempCtx) {
  showValidationError(
    '❌ Photo processing is temporarily unavailable. Please try another photo.'
  );
  autoDetectLocked = false;
  setDetectButtonState('auto');
  return;
}

tempCtx.drawImage(img, 0, 0);

/* ===== Grayscale validation ===== */
const imageData = tempCtx.getImageData(
  0,
  0,
  tempCanvas.width,
  tempCanvas.height
).data;

let sampledPixels = 0;
let colorPixels = 0;

for (let i = 0; i < imageData.length; i += 160) {
  const r = imageData[i];
  const g = imageData[i + 1];
  const b = imageData[i + 2];
  const alpha = imageData[i + 3];

  if (alpha < 20) continue;

  sampledPixels++;

  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);

  if (maxChannel - minChannel >= 10) {
    colorPixels++;
  }
}

const colorPixelRatio =
  sampledPixels > 0
    ? colorPixels / sampledPixels
    : 1;

const grayscaleImage =
  colorPixelRatio < 0.025;

console.log('GRAYSCALE VALIDATION:', {
  sampledPixels,
  colorPixels,
  colorPixelRatio,
  grayscaleImage
});

if (grayscaleImage) {
  showValidationError(
    '❌ A color photo is required.<br>Black-and-white photos cannot be processed automatically.'
  );

  setDetectButtonState('deny');
  setCreateEnabled(false);
  autoDetectLocked = false;

  if (expertCard) {
    expertCard.style.display = 'block';
  }

  statusEl.textContent =
    'A color photo is required. Please upload another photo or use Expert Manual Editing.';

  return;
}
/* ===== End grayscale validation ===== */

function runFaceMeshOnce(image) {
      return new Promise(async function(resolve, reject) {
        let finished = false;

        fm.onResults(function(results) {
          if (finished) return;
          finished = true;
          resolve(results);
        });

        try {
          await fm.send({ image });
        } catch (err) {
          reject(err);
        }
      });
    }

window.runFaceMeshOnce = runFaceMeshOnce;    

function runPoseOnce(image) {
  return new Promise(async function(resolve, reject) {
    try {
      const pose = await initPoseDetector();
      let finished = false;

      pose.onResults(function(results) {
        if (finished) return;
        finished = true;
        resolve(results);
      });

      await pose.send({ image: image });
    } catch (err) {
      reject(err);
    }
  });
}

    // 1st Detect: warm-up only
    await runFaceMeshOnce(tempCanvas);

    await new Promise(function(resolve) {
      setTimeout(resolve, 150);
    });

    // 2nd Detect: final result
    
    const detected = await runFaceMeshOnce(tempCanvas);
    const poseDetected = await runPoseOnce(tempCanvas);
    const poseComposition = validatePoseComposition(poseDetected);
    const shoulderAlignment = getShoulderAlignmentMeasurement(poseDetected);

const poseRecoverable =
  !poseComposition.pass;

if (poseRecoverable) {
  console.warn(
    'POSE COMPOSITION RECOVERABLE:',
    poseComposition
  );
}
    if (poseDetected && poseDetected.poseLandmarks) {
  console.log("========== POSE DEBUG ==========");

  console.table({
    leftShoulder: poseDetected.poseLandmarks[11],
    rightShoulder: poseDetected.poseLandmarks[12],
    leftElbow: poseDetected.poseLandmarks[13],
    rightElbow: poseDetected.poseLandmarks[14]
  });
} else {
  console.log("========== POSE DEBUG ==========");
  console.log("Pose landmarks not detected");
}

    if (!detected || !detected.multiFaceLandmarks || !detected.multiFaceLandmarks.length) {
      showValidationError('❌ Face could not be detected.<br>Please upload another photo.');
      return;
    }

    if (detected.multiFaceLandmarks.length > 1) {
      showValidationError('❌ More than one face detected.<br>Please upload a photo with only one person.');
      return;
    }

/*
 * 같은 사진의 Auto Detect가 이미 끝났다면
 * FaceMesh 결과를 다시 적용하지 않는다.
 */
if (
  autoDetectLocked &&
  window.usvisaLastValidationResult &&
  lockedDetection
) {
  console.log(
    'Auto Detect already completed for this photo.'
  );

  return;
}


    const lm = detected.multiFaceLandmarks[0];

    const leftEye = lm[33];
    const rightEye = lm[263];
    faceTiltAngle = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x
    );

    detectedLm = lm;

const validation = validateDetectedPhoto(lm, iw, ih, img);
if (!validation) return;

if (poseRecoverable && validation.pass) {
    validation.pass = false;
    validation.failureReason = "professionalRecoverable";
}

const basicAlignment = calculateBasicAlignmentCorrection({
  eyeAngle: faceTiltAngle,
  shoulderMeasurement: shoulderAlignment,
});

lockedDetection = {
  landmarks: lm,
  iw,
  ih,

  imageWidth: iw,
  imageHeight: ih,

  /*
   * faceTiltAngle은 검출 원본값으로 유지한다.
   * 실제 사진 생성에는 alignment.angle만 사용한다.
   */
  faceTiltAngle,
  shoulderAlignment,
  alignment: basicAlignment,

  crownY: Number.isFinite(validation.layoutCrownY)
  ? validation.layoutCrownY
  : validation.estimatedCrownY,
  chinY: validation.detectedChinY,

  foreheadY: validation.foreheadY,
  faceHeight: validation.faceHeight
};
lockedDetectionFingerprint = currentPhotoFingerprint || '';

if (validation.failureReason === 'glassesReview') {
  const glassesEvidence =
    window.usvisaLastValidationResult &&
    window.usvisaLastValidationResult.appearance
      ? window.usvisaLastValidationResult.appearance.glasses
      : null;
  const reviewMessage =
    'Glasses or strong eyewear evidence were detected. Basic creation is paused.<br><br>' +
    'Choose Embassy-Ready Upgrade to preview the photo with the glasses removed, or upload a new photo without glasses.';
  photoValidationPassed = false;
  autoDetectLocked = true;
  window.usvisaRecoverable = true;
  window.usvisaGlassesRemovalRequired = true;
  saveAutoDetectReview(currentPhotoFingerprint, lockedDetection, reviewMessage, glassesEvidence);
  showValidationRecoverable(reviewMessage);
  setDetectButtonState('warning');
  setCreateEnabled(false);
  return;
}


let eyebrowClearance = 'UNCERTAIN';

if (checkEyebrows) {
  checkEyebrows.style.display = EYEBROW_CLEARANCE_REQUIRED ? 'block' : 'none';
  if (EYEBROW_CLEARANCE_REQUIRED) {
    checkEyebrows.textContent = '🟠 Checking full eyebrow clearance...';
  }
}



if (EYEBROW_CLEARANCE_REQUIRED) {
  const eyebrowInspection = inspectEyebrowHairOverlap(lm, iw, ih, img);

  currentEyebrowOverlapDetected =
    !eyebrowInspection.uncertain &&
    eyebrowInspection.overlap === true;

  eyebrowClearance = eyebrowInspection.uncertain
    ? 'UNCERTAIN'
    : eyebrowInspection.overlap
      ? 'HAIR_OVERLAP'
      : 'CLEAR';

  console.log('EYEBROW OPTION STATE:', {
    eyebrowClearance,
    currentEyebrowOverlapDetected
  });
} else {
  currentEyebrowOverlapDetected = false;
}

const sourceType = await sourceCheckPromise;

console.log('SOURCE TYPE DEBUG:', sourceType);

if (EYEBROW_CLEARANCE_REQUIRED) {
  if (eyebrowClearance === 'CLEAR') {
    if (checkEyebrows) {
      checkEyebrows.textContent = '✅ Both eyebrows completely visible';
    }
  } else {
    const eyebrowMessage = eyebrowClearance === 'HAIR_OVERLAP'
      ? 'Hair overlaps or touches an eyebrow. Korea and China require both eyebrows to be completely visible with no hair overlap.<br>Please upload another photo with all hair separated from both eyebrows.'
      : 'Both eyebrows could not be verified as completely visible. Korea and China require the full outline of both eyebrows with no hair overlap.<br>Please upload a clearer photo with all hair separated from both eyebrows.';

    if (checkEyebrows) {
      checkEyebrows.textContent = eyebrowClearance === 'HAIR_OVERLAP'
        ? '❌ Hair overlaps an eyebrow'
        : '❌ Full eyebrow clearance could not be verified';
    }

    autoDetectLocked = true;
    showValidationError(eyebrowMessage);
    return;
  }
}

if (
  sourceType === 'PRINTED_PHOTO' ||
  sourceType === 'PHOTO_OF_PHOTO' ||
  sourceType === 'SCREEN_CAPTURE'
) {
  const expertOnlyMessage =
    'This appears to be a photographed printed photo or screen image.<br><br>' +
    'Automatic creation is disabled for this source.<br><br>' +
    'Please use Expert Manual Editing for best results.';

  photoValidationPassed = false;
  autoDetectLocked = true;
  window.usvisaRecoverable = false;

  saveAutoDetectExpertOnly(
    currentPhotoFingerprint,
    lockedDetection,
    expertOnlyMessage,
    sourceType
  );

  showValidationExpertOnly(expertOnlyMessage);
  setDetectButtonState('warning');
  setCreateEnabled(false);

  if (createBtn) {
    createBtn.style.display = 'none';
  }

  if (professionalCard) {
    professionalCard.style.display = 'none';
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.style.display = 'none';
  }

  if (expertCard) {
    expertCard.style.display = 'block';
  }

  statusEl.textContent =
    'Expert Manual Editing is required for this photo source.';

  return;
}

if (poseRecoverable) {
  window.usvisaRecoverable = true;

  const recoverableMessage =
    'This photo needs more composition space for standard preparation.<br><br>' +
    'Professional Retouch can extend the clothing and shoulder area automatically.';

  photoValidationPassed = false;
  autoDetectLocked = true;

  saveAutoDetectRecoverable(
    currentPhotoFingerprint,
    lockedDetection,
    recoverableMessage
  );

 setDetectButtonState('warning');
setCreateEnabled(false);

showValidationRecoverable(
  recoverableMessage
);

  if (createBtn) {
    createBtn.style.display = 'none';
  }

  if (professionalCard) {
    professionalCard.style.display = 'block';
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.style.display = 'block';
    applyProfessionalPreviewDailyState();
  }

  if (expertCard) {
    expertCard.style.display = 'block';
  }

  statusEl.textContent =
    'This photo is eligible for Professional Retouch or Expert Manual Editing.';

  return;
}



crownLine.style.display = 'none';
chinLine.style.display = 'none';

showCreatePhotoButton();

setCreateEnabled(true);

setDetectButtonState('success');

saveAutoDetectPass(
  currentPhotoFingerprint,
  lockedDetection,
  window.usvisaLastValidationReport
);

showValidationReady();



  } catch (err) {
    console.error(err);
    photoValidationPassed = false;
    autoDetectLocked = false;
    setCreateEnabled(false);
    setDetectButtonState('auto');
    if (validationCard) {
      validationCard.style.display = 'block';
      validationCard.className = 'validation-card validation-error';
    }
    if (validationFinal) {
      validationFinal.innerHTML =
        '<div style="font-size:20px;font-weight:900;color:#b45309;">PROCESSING ERROR</div>' +
        '<div style="margin-top:10px;line-height:1.7;">Auto Detect could not finish. No DENY decision was saved. Please try Auto Detect again.</div>';
    }
    statusEl.textContent = 'Auto Detect could not finish. Please try again.';
  }
});
async function removeBackgroundWithPhotoRoom() {
  if (!uploadedFile) throw new Error('No uploaded file.');

  statusEl.textContent = 'Processing background...';

  const formData = new FormData();
  formData.append('image', uploadedFile);

  const response = await fetch('/api/remove-background', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(await response.text() || 'Background removal failed.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return await new Promise(function(resolve, reject) {
    const img = new Image();
    img.onload = function() { resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

function enhanceCanvas(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) continue;

    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.08 + 132));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.08 + 132));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.08 + 132));
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyPreviewProtection(ctx, width, height) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(ctx.canvas, 0, 0);

  ctx.drawImage(tempCanvas, 0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 16px Arial';
  ctx.rotate(-0.45);

  for (let y = -height; y < height * 2; y += 110) {
    for (let x = -width; x < width * 2; x += 280) {
      ctx.fillText('USVISAPHOTO PREVIEW', x, y);
    }
  }

  ctx.restore();
}

function normalizeEmbassyWhiteBackground(targetCtx, width, height) {
  const image = targetCtx.getImageData(0, 0, width, height);
  const data = image.data;
  const samplePoints = [
    [4, 4],
    [width - 5, 4],
    [4, Math.round(height * 0.35)],
    [width - 5, Math.round(height * 0.35)]
  ];
  let refR = 0;
  let refG = 0;
  let refB = 0;

  samplePoints.forEach(function (point) {
    const index = (point[1] * width + point[0]) * 4;
    refR += data[index];
    refG += data[index + 1];
    refB += data[index + 2];
  });
  refR /= samplePoints.length;
  refG /= samplePoints.length;
  refB /= samplePoints.length;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function isBackgroundPixel(pixelIndex) {
    const offset = pixelIndex * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    const channelSpread = Math.max(r, g, b) - Math.min(r, g, b);
    const colorDistance = Math.sqrt(
      Math.pow(r - refR, 2) +
      Math.pow(g - refG, 2) +
      Math.pow(b - refB, 2)
    );
    return brightness >= 175 && channelSpread <= 38 && colorDistance <= 72;
  }

  function enqueue(x, y) {
    const pixelIndex = y * width + x;
    if (visited[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
    visited[pixelIndex] = 1;
    queue[tail++] = pixelIndex;
  }

  for (let x = 0; x < width; x += 2) enqueue(x, 0);
  for (let y = 0; y < Math.round(height * 0.72); y += 2) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const pixelIndex = queue[head++];
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < height) enqueue(x, y + 1);
  }

  for (let pixelIndex = 0; pixelIndex < visited.length; pixelIndex++) {
    if (!visited[pixelIndex]) continue;
    const offset = pixelIndex * 4;
    data[offset] = 255;
    data[offset + 1] = 255;
    data[offset + 2] = 255;
    data[offset + 3] = 255;
  }

  targetCtx.putImageData(image, 0, 0);
}

function traceLandmarkRegion(targetContext, indices, landmarks, sourceWidth, sourceHeight, offsetX, offsetY) {
  targetContext.beginPath();

  indices.forEach(function (index, position) {
    const point = landmarks[index];
    if (!point) return;

    const x = point.x * sourceWidth + offsetX;
    const y = point.y * sourceHeight + offsetY;

    if (position === 0) targetContext.moveTo(x, y);
    else targetContext.lineTo(x, y);
  });

  targetContext.closePath();
}

function applyBasicNaturalRetouch(targetContext, sourceImg, sourceWidth, sourceHeight, finalCenterX, crownY) {
  const landmarks = lockedDetection && lockedDetection.landmarks;
  if (!landmarks || landmarks.length < 468) return;

  const offsetX = -finalCenterX;
  const offsetY = -crownY;
  const cheekRegions = [
    [50, 101, 205, 203, 123, 116, 117, 118, 119, 100],
    [280, 330, 425, 423, 352, 345, 346, 347, 348, 329],
  ];

  /*
   * BASIC keeps identity and facial geometry untouched. A small amount of
   * source-image blur is blended only into the cheek/skin regions; eyes,
   * eyebrows, nose edges, lips, hair, clothing, and background are excluded.
   */
  cheekRegions.forEach(function (region) {
    targetContext.save();
    traceLandmarkRegion(targetContext, region, landmarks, sourceWidth, sourceHeight, offsetX, offsetY);
    targetContext.clip();
    targetContext.globalAlpha = 0.11;
    targetContext.filter = 'blur(0.65px)';
    targetContext.drawImage(sourceImg, offsetX, offsetY);
    targetContext.restore();

    targetContext.save();
    traceLandmarkRegion(targetContext, region, landmarks, sourceWidth, sourceHeight, offsetX, offsetY);
    targetContext.globalCompositeOperation = 'soft-light';
    targetContext.globalAlpha = 0.035;
    targetContext.fillStyle = '#f6a18f';
    targetContext.fill();
    targetContext.restore();
  });

  // A restrained rose tone adds lip vitality without changing lip shape.
  const outerLip = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
  targetContext.save();
  traceLandmarkRegion(targetContext, outerLip, landmarks, sourceWidth, sourceHeight, offsetX, offsetY);
  targetContext.globalCompositeOperation = 'soft-light';
  targetContext.globalAlpha = 0.075;
  targetContext.fillStyle = '#d96876';
  targetContext.fill();
  targetContext.restore();
}

function drawFinalPhoto(sourceImg) {
  if (!lockedDetection) throw new Error('No locked detection.');

  const crownY = lockedDetection.crownY;
  const chinY = lockedDetection.chinY;

  if (!Number.isFinite(crownY) || !Number.isFinite(chinY) || chinY <= crownY) {
    throw new Error('Invalid locked crown/chin geometry.');
  }

  const currentHeadPx = Math.max(1, chinY - crownY);
const headScaleCalibration =
  format === 'us' ||
  format === '2x2' ||
  (
    format === 'country-default' &&
    String(
      window.EMBASSY_PHOTO_PROFILE?.code || ''
    ).toUpperCase() === 'US'
  )
    ? 0.765625
    : (
        format === 'international' ||
        format === '35x45'
      )
      ? (32 / 37)
      : 1;

const scale =
  (
    targetHeadPx /
    currentHeadPx
  ) *
  headScaleCalibration;

  const sourceWidth = sourceImg.naturalWidth || sourceImg.width;
  const centerX = sourceWidth / 2;

  const finalCenterX = getFaceCenterX(
    lockedDetection.landmarks,
    sourceWidth,
    centerX
  );

  canvas.width = TARGET;
  canvas.height = TARGET_HEIGHT;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, TARGET, TARGET_HEIGHT);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARGET, TARGET_HEIGHT);

  ctx.save();
  ctx.translate(TARGET / 2, TOP_MARGIN_PX + 12);
  ctx.rotate(-resolveLockedAlignmentAngle(lockedDetection));
  ctx.scale(scale, scale);
  ctx.drawImage(sourceImg, -finalCenterX, -crownY);
  applyBasicNaturalRetouch(
    ctx,
    sourceImg,
    sourceWidth,
    sourceImg.naturalHeight || sourceImg.height,
    finalCenterX,
    crownY
  );
  ctx.restore();

  // PhotoRoom already supplies a transparent subject mask. The canvas was
  // filled pure white before compositing, so a second color flood can only
  // damage light clothing and is intentionally skipped here.
 drawOverlayGuide();
  return canvas.toDataURL('image/jpeg', 0.99);
}
  function drawOverlayGuide(targetContext, targetWidth, targetHeight) {

  if (!targetContext && !overlayCanvas) return;

  if (!targetContext) {
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    overlayCanvas.style.display = "block";
  }

  const octx = targetContext || overlayCanvas.getContext("2d");
  const W = targetContext ? targetWidth : overlayCanvas.width;
  const H = targetContext ? targetHeight : overlayCanvas.height;

  if (!targetContext) {
    octx.clearRect(0,0,W,H);
  }

  //----------------------------------
  // Photo Border
  //----------------------------------

  const margin = 18;
  const guideWidth = W - margin * 2;
const guideHeight = H - margin * 2;

  octx.strokeStyle="#d9d7ff";
  octx.lineWidth=2;
  octx.setLineDash([8,6]);

  octx.strokeRect(
    margin,
    margin,
    guideWidth,
    guideHeight
);

  //----------------------------------
  // Head Area
  //----------------------------------

  const headTop =
  TOP_MARGIN_PX + 32;

const headBottom =
  headTop + TARGET_HEAD_PX;

const faceHeightPx =
    headBottom - headTop;

const faceHeightMm =
    (faceHeightPx / H) * Number(COUNTRY_PROFILE.heightMm || 50.8);
const faceHeightLabel = COUNTRY_CODE === 'US'
  ? (faceHeightMm / 25.4).toFixed(1) + ' in'
  : Math.round(faceHeightMm) + ' mm';

  octx.strokeStyle="#58d6b4";

  octx.beginPath();

  octx.moveTo(
    margin + 25,
    headTop
);
 octx.lineTo(
    W - margin - 25,
    headTop
);

 octx.moveTo(
    margin + 25,
    headBottom
);
 octx.lineTo(
    W - margin - 25,
    headBottom
);

  octx.stroke();

  //----------------------------------
  // Face Height

  //----------------------------------

  const measureX=W-32;

  octx.beginPath();

  octx.moveTo(measureX,headTop);

  octx.lineTo(measureX,headBottom);

  octx.stroke();

  octx.fillStyle="#32c987";

  octx.fillRect(
      measureX-18,
      (headTop+headBottom)/2-15,
      60,
      30
  );

  octx.fillStyle="white";

  octx.font="bold 16px Arial";

  octx.fillText(
      faceHeightLabel,
      measureX-17,
      (headTop+headBottom)/2+6
  );

  //----------------------------------
  // TOP 2 inch

  //----------------------------------

  octx.fillStyle="#1b2645";

  octx.fillRect(
      W/2-32,
      0,
      64,
      28
  );

  octx.fillStyle="white";

  octx.font="bold 16px Arial";

  octx.fillText(
      COUNTRY_CODE === 'US' ? '2 in' : String(COUNTRY_PROFILE.widthMm) + ' mm',
      W/2-16,
      20
  );

  //----------------------------------
  // LEFT 2 inch

  //----------------------------------

  octx.save();

  octx.translate(
      0,
      H/2
  );

  octx.rotate(-Math.PI/2);

  octx.fillStyle="#1b2645";

  octx.fillRect(
      -32,
      0,
      64,
      28
  );

  octx.fillStyle="white";

  octx.fillText(
      COUNTRY_CODE === 'US' ? '2 in' : String(COUNTRY_PROFILE.heightMm) + ' mm',
      -16,
      20
  );

  octx.restore();

  //----------------------------------
  // Bottom Brand

  //----------------------------------

  octx.fillStyle="rgba(0,0,0,.45)";

  octx.fillRect(
    margin,
    guideHeight + margin - 28,
    guideWidth,
    28
);

  octx.fillStyle="white";

  octx.font="16px Arial";

  octx.fillText(
      "USVisaPhoto Preview",
      30,
      H-26
  );

  //----------------------------------

  octx.setLineDash([]);

}
 
async function measureProfessionalFaceGeometry(sourceInput) {
  let sourceImage = sourceInput;

  if (typeof sourceInput === 'string') {
    sourceImage = await new Promise(function(resolve, reject) {
      const image = new Image();

      image.onload = function() {
        resolve(image);
      };

      image.onerror = function() {
        reject(
          new Error(
            'E.R.U MASTER could not be loaded for face measurement.'
          )
        );
      };

      image.src = sourceInput;
    });
  }

  if (
    !sourceImage ||
    !sourceImage.naturalWidth ||
    !sourceImage.naturalHeight
  ) {
    throw new Error(
      'E.R.U MASTER is invalid for face measurement.'
    );
  }

  const width =
    sourceImage.naturalWidth ||
    sourceImage.width;

  const height =
    sourceImage.naturalHeight ||
    sourceImage.height;

  const canvas =
    document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext('2d');

  if (!context) {
    throw new Error(
      'E.R.U face measurement canvas is unavailable.'
    );
  }

  context.drawImage(
    sourceImage,
    0,
    0,
    width,
    height
  );

  // 기존 Auto Detect와 동일하게 warm-up 후 실제 측정
 await runFaceMeshOnce(canvas);

  await new Promise(function(resolve) {
    setTimeout(resolve, 150);
  });

  const detected =
  await runFaceMeshOnce(canvas);

  if (
    !detected ||
    !detected.multiFaceLandmarks ||
    detected.multiFaceLandmarks.length !== 1
  ) {
    throw new Error(
      'E.R.U MASTER face geometry could not be measured.'
    );
  }

  const lm =
    detected.multiFaceLandmarks[0];

  const validation =
    validateDetectedPhoto(
      lm,
      width,
      height,
      sourceImage
    );

  if (!validation) {
    throw new Error(
      'E.R.U MASTER face validation failed.'
    );
  }

  const crownY =
    Number.isFinite(validation.layoutCrownY)
      ? validation.layoutCrownY
      : validation.estimatedCrownY;

  const chinY =
    validation.detectedChinY;

  if (
    !Number.isFinite(crownY) ||
    !Number.isFinite(chinY) ||
    chinY <= crownY
  ) {
    throw new Error(
      'E.R.U MASTER crown/chin geometry is invalid.'
    );
  }

  const faceCenterX =
  getFaceCenterX(
    lm,
    width,
    width / 2
  );

/*
 * E.R.U 결과 이미지 자체의 수평을 다시 측정한다.
 *
 * FaceMesh:
 * 33  = 한쪽 눈 바깥쪽
 * 263 = 반대쪽 눈 바깥쪽
 *
 * OpenAI retouch 이후 발생할 수 있는 미세한 회전을
 * 최종 규격 생성 단계에서 바로잡기 위한 값이다.
 */


 /*
 * E.R.U 결과 이미지 자체의 수평을 다시 측정한다.
 *
 * 한쪽 눈의 단일 랜드마크끼리 비교하지 않고
 * 각 눈의 여러 랜드마크 평균 중심을 사용한다.
 * 개인의 자연스러운 눈꼬리 모양이나 미세 비대칭이
 * 사진 전체 회전으로 잘못 해석되는 것을 줄인다.
 */
const leftEyeIndices = [
  33, 133, 159, 145
];

const rightEyeIndices = [
  263, 362, 386, 374
];

function getEyeCenter(indices) {
  const points = indices
    .map(function(index) {
      return lm[index];
    })
    .filter(Boolean);

  if (!points.length) {
    return null;
  }

  const sum = points.reduce(
    function(acc, point) {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  return {
    x: (sum.x / points.length) * width,
    y: (sum.y / points.length) * height,
  };
}

const leftEyeCenter =
  getEyeCenter(leftEyeIndices);

const rightEyeCenter =
  getEyeCenter(rightEyeIndices);

let faceTiltAngle = 0;
let measuredEyeAngle = 0;

if (
  leftEyeCenter &&
  rightEyeCenter
) {
  const eyeDx =
    rightEyeCenter.x -
    leftEyeCenter.x;

  const eyeDy =
    rightEyeCenter.y -
    leftEyeCenter.y;

  if (Math.abs(eyeDx) > 1) {
    measuredEyeAngle =
      Math.atan2(
        eyeDy,
        eyeDx
      );

    const measuredDegrees =
      measuredEyeAngle *
      180 /
      Math.PI;

    /*
     * 0.35° 이하는 FaceMesh 측정 오차나
     * 자연스러운 좌우 눈 비대칭으로 간주한다.
     *
     * E.R.U에서는 눈을 억지로 완벽한 수평으로
     * 만드는 것이 아니라 사진의 명확한 기울기만 보정한다.
     */
    const deadZoneDegrees = 0.35;

    /*
     * E.R.U retouch 이후의 미세 회전만 바로잡는다.
     * 과도한 자동 회전을 방지하기 위해 ±2°로 제한한다.
     */
    const maxCorrectionDegrees = 2.0;

    if (
      Math.abs(measuredDegrees) >
      deadZoneDegrees
    ) {
      const limitedDegrees =
        Math.max(
          -maxCorrectionDegrees,
          Math.min(
            maxCorrectionDegrees,
            measuredDegrees
          )
        );

      faceTiltAngle =
        limitedDegrees *
        Math.PI /
        180;
    }
  }
}

console.log('ERU_MASTER_FACE_QA', {
  sourceWidth: width,
  sourceHeight: height,
  crownY,
  chinY,
  headPixels: chinY - crownY,
  faceCenterX,
  measuredEyeDegrees:
  measuredEyeAngle * 180 / Math.PI,
faceTiltAngle,
faceTiltDegrees:
  faceTiltAngle * 180 / Math.PI,
});

return {
  sourceImage,
  width,
  height,
  crownY,
  chinY,
  faceCenterX,
  faceTiltAngle,
  landmarks: lm,
};
}
async function createProfessionalAlignedPhoto(sourceInput) {
  if (!lockedDetection) {
    throw new Error(
      'No locked detection for professional alignment.'
    );
  }

  if (
    typeof window.createProfessionalPhotoLayout !==
    'function'
  ) {
    throw new Error(
      'Professional photo layout engine is not loaded.'
    );
  }

  let sourceImg = sourceInput;

  if (typeof sourceInput === 'string') {
    sourceImg = await new Promise(
      function (resolve, reject) {
        const img = new Image();

        img.onload = function () {
          resolve(img);
        };

        img.onerror = function () {
          reject(
            new Error(
              'Professional source image could not be loaded.'
            )
          );
        };

        img.src = sourceInput;
      }
    );
  }

  if (
    !sourceImg ||
    !sourceImg.naturalWidth ||
    !sourceImg.naturalHeight
  ) {
    throw new Error(
      'Professional source image is invalid.'
    );
  }

  const crownY =
    Number(lockedDetection.crownY);

  const chinY =
    Number(lockedDetection.chinY);

  if (
    !Number.isFinite(crownY) ||
    !Number.isFinite(chinY) ||
    chinY <= crownY
  ) {
    throw new Error(
      'Invalid professional alignment geometry.'
    );
  }

  const sourceWidth =
    sourceImg.naturalWidth ||
    sourceImg.width;

  const sourceCenterX =
    sourceWidth / 2;

  const detectedFaceCenterX =
    getFaceCenterX(
      lockedDetection.landmarks,
      sourceWidth,
      sourceCenterX
    );

  const faceTiltAngle =
    resolveLockedAlignmentAngle(
      lockedDetection
    );

  return await window.createProfessionalPhotoLayout({
    sourceInput: sourceImg,

    /*
     * Professional Preview의 기본 결과는
     * 미국 비자 2×2 inch 규격이다.
     *
     * 정수리부터 턱까지 28mm로 생성된다.
     */
    format: 'us',

    crownY,
    chinY,

    faceCenterX:
      detectedFaceCenterX,

    faceTiltAngle,
  });
}
async function createFinalJpegWithSharp(dataUrl) {
  const blob = await fetch(dataUrl).then((res) => res.blob());

  const formData = new FormData();
  formData.append('image', blob, 'canvas-photo.png');
  formData.append('format', COUNTRY_CODE.toLowerCase());

  const response = await fetch('/api/final-photo', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text() || 'Final JPEG generation failed.');
  }

  const finalBlob = await response.blob();

  return await new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.onerror = reject;
    reader.readAsDataURL(finalBlob);
  });
}

async function createInternationalPhotoFromResult(sourceUrl, requestedSize) {
  if (
    typeof window.createProfessionalPhotoLayout !==
    'function'
  ) {
    throw new Error(
      'Professional photo layout engine is not loaded.'
    );
  }

  if (!sourceUrl) {
    throw new Error(
      'Professional source photo is unavailable.'
    );
  }

  /*
   * sourceUrl은 이미 완성된 미국 2×2 Professional 사진이다.
   *
   * 미국 Professional 규격:
   * - 캔버스: 600×600
   * - 상단 여백: 5mm
   * - 정수리~턱: 28mm
   * - 실제 사진 높이: 50.8mm
   *
   * 이 좌표를 기준으로 국제 규격 엔진에 다시 배치한다.
   * 가로와 세로를 따로 늘리지 않으므로 인물 비율이 유지된다.
   */
 const sourceImage = await new Promise(function (resolve, reject) {
  const image = new Image();

  image.onload = function () {
    resolve(image);
  };

  image.onerror = reject;
  image.src = sourceUrl;
});

const usCanvasWidth =
  sourceImage.naturalWidth || sourceImage.width;

const usCanvasHeight =
  sourceImage.naturalHeight || sourceImage.height;

/*
 * E.R.U final U.S. photo geometry
 *
 * The E.R.U result reaching this function is already the
 * finished U.S. 2x2 composition.
 *
 * Crown position: 5 mm from top
 * Crown-to-chin: 28 mm
 * Physical canvas: 50.8 mm
 */

const usCrownY =
  usCanvasHeight * (5 / 50.8);

const usHeadHeightPx =
  usCanvasHeight * (28 / 50.8);

const usChinY =
  usCrownY + usHeadHeightPx;

  return await window.createProfessionalPhotoLayout({
    sourceInput: sourceUrl,

    format: requestedSize || '35x45',

    crownY: usCrownY,
    chinY: usChinY,

    faceCenterX:
      usCanvasWidth / 2,

    /*
     * 미국 Professional 사진을 만들 때
     * 이미 기울기 보정이 끝났으므로 0을 사용한다.
     */
    faceTiltAngle: 0,
  });
}

async function createAdditionalPhotoFromOriginal(requestedSize) {
  if (!lockedDetection || !requestedSize) {
    throw new Error('Additional-size face geometry is unavailable.');
  }
  const sourceImage = bgRemovedImg || uploadedImg;
  if (!sourceImage) throw new Error('Additional-size source photo is unavailable.');
  const sourceWidth = sourceImage.naturalWidth || sourceImage.width;
  return await window.createProfessionalPhotoLayout({
    sourceInput: sourceImage,
    format: requestedSize,
    crownY: Number(lockedDetection.crownY),
    chinY: Number(lockedDetection.chinY),
    faceCenterX: getFaceCenterX(lockedDetection.landmarks, sourceWidth, sourceWidth / 2),
    faceTiltAngle: resolveLockedAlignmentAngle(lockedDetection),
  });
}

async function createCountryProfessionalPhotoFromAi(
  sourceUrl
) {
  const geometry =
    await measureProfessionalFaceGeometry(
      sourceUrl
    );

  return await window.createProfessionalPhotoLayout({
    sourceInput: geometry.sourceImage,
    format: 'country-default',
    crownY: geometry.crownY,
    chinY: geometry.chinY,
    faceCenterX: geometry.faceCenterX,
    faceTiltAngle: geometry.faceTiltAngle,
  });
}
 async function createProfessionalExtraPhotoFromAi(
  sourceUrl,
  requestedSize
) {
  const geometry =
    await measureProfessionalFaceGeometry(
      sourceUrl
    );

  return await window.createProfessionalPhotoLayout({
    sourceInput: geometry.sourceImage,
    format: requestedSize,
    crownY: geometry.crownY,
    chinY: geometry.chinY,
    faceCenterX: geometry.faceCenterX,
    faceTiltAngle: geometry.faceTiltAngle,
  });
}
let createPhotoBusy = false;

if (eruScrollBtn) {
  eruScrollBtn.addEventListener('click', function() {
    if (!professionalCard) {
      return;
    }

    professionalCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });
}
createBtn.addEventListener('click', async function(e) {
  e.preventDefault();

  if (createPhotoBusy) {
    return;
  }

 
 

  const photoState = getPhotoState();
  
if (
  photoState.fingerprint === currentPhotoFingerprint &&
  photoState.created === true
) {
  const restored = restorePreviouslyCreatedPhoto();
  if (restored) {
    return;
  }
  // Restore failed (e.g. cached preview data was evicted from
  // localStorage while the small "created" flag survived).
  // Fall through and create the photo fresh instead of doing nothing.
}

  if (!uploadedImg || !uploadedFile) {
    statusEl.textContent = 'Please upload a photo first.';
    return;
  }

  if (!ensureCreateReadyForCurrentPhoto()) {
    statusEl.textContent =
      'Create is blocked because Auto Detect PASS was not saved. Please click Auto Detect again.';
    setCreateEnabled(false);
    return;
  }

  createPhotoBusy = true;
  let createSucceeded = false;

  try {
    setCreateEnabled(false);
    createBtn.textContent = 'Creating...';
statusEl.textContent = 'Creating your photo...';

writeStoredPhoto('usvisa_pending_professional_photo', '');
writeStoredPhoto('usvisa_pending_professional_international_photo', '');
writeStoredPhoto('usvisa_pending_professional_photo_fingerprint', '');
writeStoredPhoto('usvisa_pending_professional_photo_version', '');

if (retouchImage) {
  retouchImage.removeAttribute('src');
}

if (retouchPreview) {
    retouchPreview.style.display = 'none';
    retouchPreview.classList.remove('is-visible');
}

if (professionalRetouchBtn) {
  applyProfessionalPreviewDailyState();
}
if (!bgRemovedImg) {
      try {
        bgRemovedImg = await removeBackgroundWithPhotoRoom();
      } catch (backgroundError) {
        console.error(
          'BACKGROUND REMOVAL ERROR:',
          backgroundError
        );
        statusEl.textContent =
          'Create clicked, but background removal failed. Using the original photo for preview.';
        bgRemovedImg = uploadedImg;
      }
    }

    const rawCleanUrl = drawFinalPhoto(bgRemovedImg);
const cleanUrl = await createFinalJpegWithSharp(rawCleanUrl);
let securedBasicPhoto = null;
let securedBasicExtraPhoto = null;
    
    resultUrl = isLocalAdminEnvironment() ? cleanUrl : '';
    markPhotoCreated(currentPhotoFingerprint);
  
    setCreateEnabled(false);
createBtn.textContent = '✔ Preview Ready';

statusEl.innerHTML =
  'Protected Preview Ready<br>' +
  'Checkout to receive the original HD JPG without watermark.';

if (professionalCard) {
  professionalCard.style.display = 'block';
}

if (professionalRetouchBtn) {
  professionalRetouchBtn.style.display = 'block';
  applyProfessionalPreviewDailyState();
}

  setDownloadEnabled(true);
downloadBtn.disabled = false;
const selected = getSelectedBasicPackage();

downloadBtn.textContent =
  selected === 'visa-plus-international'
    ? '🔓 Unlock Both Photo Sizes · $7.99'
    : '🔓 Unlock HD Photo · $4.99';
    try { 
    
  const selectedExtraSize = getSelectedBasicExtraSize();
  const internationalPhoto = selectedExtraSize
    ? await createAdditionalPhotoFromOriginal(selectedExtraSize)
    : '';
securedBasicPhoto = await protectPhotoForCheckout(cleanUrl);
securedBasicExtraPhoto = internationalPhoto
    ? await protectPhotoForCheckout(internationalPhoto)
    : null;

  writeStoredPhoto(
    'usvisa_pending_international_photo',
    ''
  );
  writeStoredPhoto('usvisa_secure_basic_photo', securedBasicPhoto.token);
  writeStoredPhoto('usvisa_secure_basic_extra_photo', securedBasicExtraPhoto ? securedBasicExtraPhoto.token : '');
  writeStoredPhoto('usvisa_pending_extra_size_key', selectedExtraSize);
} catch (error) {
  console.error(
    'INTERNATIONAL PHOTO GENERATION ERROR:',
    error
  );

  writeStoredPhoto(
    'usvisa_pending_international_photo',
    ''
  );
}

    writeStoredPhoto('usvisa_clean_photo', '');
    writeStoredPhoto(
      'usvisa_basic_output_version',
      BASIC_OUTPUT_VERSION
    );
    downloadBtn.dataset.downloadCount = '0';
    setPhotoDownloadCount(0);

    const protectedCanvas = document.createElement('canvas');
    protectedCanvas.width = TARGET;
    protectedCanvas.height = TARGET_HEIGHT;
    const pctx = protectedCanvas.getContext('2d');

    const finalPreview = new Image();

    await new Promise(function(resolve, reject) {
      finalPreview.onload = resolve;
      finalPreview.onerror = reject;
      finalPreview.src = cleanUrl;
    });

    pctx.drawImage(finalPreview, 0, 0, TARGET, TARGET_HEIGHT);
    applyPreviewProtection(pctx, TARGET, TARGET_HEIGHT);
    

    if (!isLocalAdminEnvironment() && !securedBasicPhoto?.preview) {
  throw new Error('Protected Basic preview was not returned.');
}

const protectedPreviewUrl = isLocalAdminEnvironment()
  ? protectedCanvas.toDataURL('image/png')
  : securedBasicPhoto.preview;

    writeStoredPhoto('usvisa_protected_preview', protectedPreviewUrl);

    markCreatedPhotoFilesForCurrentPhoto();

    ctx.clearRect(0, 0, TARGET, TARGET_HEIGHT);
    if (isLocalAdminEnvironment()) {
      ctx.drawImage(protectedCanvas, 0, 0);
    } else {
      const securePreviewImage = new Image();
      await new Promise(function(resolve, reject) {
        securePreviewImage.onload = resolve;
        securePreviewImage.onerror = reject;
        securePreviewImage.src = protectedPreviewUrl;
      });
      ctx.drawImage(securePreviewImage, 0, 0, TARGET, TARGET_HEIGHT);
      resultUrl = protectedPreviewUrl;
    }
    

canvas.style.display = 'block';

if (resultPanel) resultPanel.style.display = 'block';


if (professionalCard) {
  professionalCard.style.display = 'block';
}

if (expertCard && professionalCard) {
  expertCard.style.display = 'block';

  professionalCard.insertAdjacentElement(
    'afterend',
    expertCard
  );
}

if (uploadTips) uploadTips.style.display = 'none';

downloadBtn.style.display = 'none';
if (uploadTips) uploadTips.style.display = 'none';

downloadBtn.style.display = 'none';
updateBasicPackageButton();

    setDownloadEnabled(true);
    statusEl.textContent = 'Preview created. Unlock download to receive the clean photo.';
    createSucceeded = true;

  } catch (err) {
    console.error('CREATE PHOTO ERROR:', err);
    statusEl.textContent =
  "Photo processing is temporarily unavailable. Please try again shortly.";
    setCreateEnabled(true);
  } finally {
    createPhotoBusy = false;

    if (createSucceeded) {
      setCreateEnabled(false);
      createBtn.textContent = '✔ Preview Ready';
    } else {
      createBtn.textContent = 'Create Photo';
    }
  }
});

function getProfessionalPreviewDailyKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return (
    'usvisa_professional_preview_daily_used_' +
    PROFESSIONAL_PREVIEW_VERSION +
    '_' +
    year +
    '-' +
    month +
    '-' +
    day
  );
}

function getProfessionalPreviewCacheKey(fingerprint) {
  if (!fingerprint) {
    return '';
  }

  return (
    'usvisa_professional_preview_cache_' +
    PROFESSIONAL_PREVIEW_VERSION +
    '_' +
    fingerprint
  );
}

function hasUsedProfessionalPreviewToday() {
  const key = getProfessionalPreviewDailyKey();

  return window.parent.localStorage.getItem(key) === '1';
}

function markProfessionalPreviewUsedToday() {
  const key = getProfessionalPreviewDailyKey();

  window.parent.localStorage.setItem(key, '1');
}

function readProfessionalPreviewForCurrentPhoto() {
  const key =
    getProfessionalPreviewCacheKey(currentPhotoFingerprint);

  if (!key) {
    return '';
  }

  return window.parent.localStorage.getItem(key) || '';
}

function writeProfessionalPreviewForCurrentPhoto(photo) {
  const key =
    getProfessionalPreviewCacheKey(currentPhotoFingerprint);

  if (!key || !photo) {
    return;
  }

  window.parent.localStorage.setItem(key, photo);
}

function applyProfessionalPreviewDailyState() {
  if (!professionalRetouchBtn) return;

    if (isLocalAdminEnvironment()) {
    professionalRetouchBtn.disabled = false;
    updateProfessionalPackageButton();
    return;
  }

  const savedProfessionalPhoto =
    readStoredPhoto('usvisa_secure_professional_photo') ||
    readStoredPhoto('usvisa_pending_professional_photo');

  if (hasUsedProfessionalPreviewToday()) {
    if (
      savedProfessionalPhoto &&
      isStoredProfessionalForCurrentPhoto()
    ) {
      professionalRetouchBtn.disabled = false;
      professionalRetouchBtn.innerHTML =
        '<span class="professional-preview-button-title">' +
        'View Saved Professional Preview' +
        '</span>' +
        '<span class="professional-preview-button-note">' +
        'No new preview will be generated' +
        '</span>';
    } else {
      professionalRetouchBtn.disabled = true;
   professionalRetouchBtn.innerHTML =
    '<span class="professional-preview-button-title">' +
    'Preview Already Used for This Photo' +
    '</span>' +
    '<span class="professional-preview-button-note">' +
    'Upload a different photo to preview again' +
    '</span>';
    }

    return;
  }

  professionalRetouchBtn.disabled = false;
  updateProfessionalPackageButton();
}
applyProfessionalPreviewDailyState();

if (professionalRetouchBtn) {
  professionalRetouchBtn.addEventListener('click', async function (e) {

  console.log('=== PROFESSIONAL BUTTON CLICKED ===');

  e.preventDefault();
  e.stopPropagation();

  if (professionalRetouchBusy) {
    return;
  }
    localEruFinalJpg = null;
localEruExtraPhotos = [];

   const savedProfessionalPhoto =
    readStoredPhoto('usvisa_secure_professional_photo') ||
    readStoredPhoto('usvisa_pending_professional_photo');

  if (
    hasUsedProfessionalPreviewToday() &&
    savedProfessionalPhoto &&
    isStoredProfessionalForCurrentPhoto()
  ) {
    if (retouchImage) {
      const protectedProfessionalPreview =
        readStoredPhoto('usvisa_pending_professional_protected_preview') ||
        await createProtectedProfessionalPreview(savedProfessionalPhoto);

      retouchImage.src =
        protectedProfessionalPreview;

      retouchImage.style.display = 'block';
    }

if (retouchPreview) {
  retouchPreview.style.removeProperty('display');
  retouchPreview.classList.add('is-visible');
}

    if (premiumCreateBtn) {
      premiumCreateBtn.style.display = 'block';
      premiumCreateBtn.disabled = false;

      updateProfessionalPackageButton();
    }

    statusEl.textContent =
      'Your saved Professional Preview has been restored.';

    return;
  }


let eruProgressNumber = 4;
const eruCountdownSeconds = 60;
const eruStartedAt = Date.now();
function renderEruProgress(value, label) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  if (eruProgress) eruProgress.hidden = false;
  if (eruProgressBar) eruProgressBar.style.width = safeValue + '%';
  if (eruProgressValue) eruProgressValue.textContent = safeValue + '%';
  if (eruProgressLabel && label) eruProgressLabel.textContent = label;
  const track = eruProgress && eruProgress.querySelector('[role="progressbar"]');
  if (track) track.setAttribute('aria-valuenow', String(safeValue));
}
renderEruProgress(eruProgressNumber, 'Preparing preview... about 60s');
professionalRetouchBtn.textContent = 'Preparing preview... about 60s';

const retouchTimer = setInterval(function () {
  const elapsedSeconds = Math.floor((Date.now() - eruStartedAt) / 1000);
  const remainingSeconds = Math.max(0, eruCountdownSeconds - elapsedSeconds);
  eruProgressNumber = Math.min(92, 4 + (elapsedSeconds / eruCountdownSeconds) * 88);
  const countdownLabel = remainingSeconds > 0
    ? 'Preparing preview... about ' + remainingSeconds + 's'
    : 'Finalizing your preview...';

  professionalRetouchBtn.textContent = countdownLabel;
  renderEruProgress(eruProgressNumber, countdownLabel);

}, 1000);

professionalPreviewLocked = true;
professionalRetouchBusy = true;
professionalRetouchBtn.disabled = true;

try {
 if (!uploadedFile || !uploadedImg) {
  throw new Error('Please upload a photo first.');
}

if (!hasLockedDetectionForCurrentPhoto()) {
  const storedAutoDetect =
    getStoredAutoDetectResult(currentPhotoFingerprint);

  const canRestoreDetection =
    storedAutoDetect &&
    storedAutoDetect.detection &&
    (
      storedAutoDetect.status === 'PASS' ||
      storedAutoDetect.status === 'REVIEW'
    );

  if (canRestoreDetection) {
    lockedDetection = storedAutoDetect.detection;
    lockedDetectionFingerprint =
      currentPhotoFingerprint || '';

    faceTiltAngle =
      lockedDetection.faceTiltAngle || 0;

    window.usvisaLastValidationReport =
      storedAutoDetect.report || null;

    window.usvisaRecoverable =
      storedAutoDetect.status === 'REVIEW';
  } else {
    throw new Error(
      'Face measurements are not available. Please run Auto Detect again.'
    );
  }
}

if (!bgRemovedImg) {
  statusEl.textContent =
    'Preparing your photo for Professional Retouch...';

  try {
    bgRemovedImg =
      await removeBackgroundWithPhotoRoom();
  } catch (backgroundError) {
    /*
     * E.R.U itself produces an embassy-white background, so an unavailable
     * optional background-removal service must not stop the upgrade.
     */
    console.warn(
      'Optional background removal unavailable; continuing with the original image.',
      backgroundError
    );
    bgRemovedImg = null;
    statusEl.textContent =
      'Background service unavailable. Continuing securely with the original photo...';
    renderEruProgress(
      Math.max(eruProgressNumber, 8),
      'Preparing original photo for Embassy-Ready Upgrade...'
    );
  }
}

const recoverable =
  window.usvisaRecoverable === true;

if (recoverable) {
  statusEl.textContent =
    'Professional Retouch will reconstruct the missing shoulder area.';
}

/*
 * E.R.U SOURCE
 *
 * Professional Retouch must start from the ORIGINAL uploaded
 * high-resolution photo.
 *
 * Do NOT run the U.S. 2x2 layout before E.R.U.
 * Do NOT use bgRemovedImg or any 600x600 derivative here.
 */
if (!uploadedFile) {
  throw new Error(
    'Original uploaded file is unavailable for Embassy-Ready Upgrade.'
  );
}

const professionalBlob = uploadedFile;

console.log('Recoverable:', recoverable);

console.log('ERU_SOURCE', {
  source: 'ORIGINAL_UPLOADED_FILE',
  fileName: professionalBlob.name,
  fileType: professionalBlob.type,
  fileBytes: professionalBlob.size,
});

const eruSourceProbeUrl =
  URL.createObjectURL(professionalBlob);

try {
  const eruSourceProbe =
    await new Promise(function(resolve, reject) {
      const image = new Image();

      image.onload = function() {
        resolve(image);
      };

      image.onerror = function() {
        reject(
          new Error(
            'Original E.R.U source image could not be decoded.'
          )
        );
      };

      image.src = eruSourceProbeUrl;
    });

  console.log(
    'ERU_SOURCE_IMAGE_SIZE =',
    eruSourceProbe.naturalWidth,
    eruSourceProbe.naturalHeight
  );
} finally {
  URL.revokeObjectURL(
    eruSourceProbeUrl
  );
}

const formData = new FormData();

formData.append(
  'image',
  professionalBlob,
  professionalBlob.name ||
    'eru-original-source.jpg'
);
formData.append('countryCode', COUNTRY_CODE);

const eyebrowClearanceRequired =
  COUNTRY_CODE === 'KR' ||
  (COUNTRY_CODE === 'US' && getSelectedProfessionalExtraSize() === '35x45');
formData.append('eyebrowClearanceRequired', eyebrowClearanceRequired ? 'true' : 'false');
const removeEyewearRequired =
  GLASSES_RULE_ENABLED &&
  window.usvisaEyewearDetected === true;

formData.append(
  'removeEyewearRequired',
  removeEyewearRequired ? 'true' : 'false'
);

console.log('E.R.U EYEWEAR REMOVAL:', {
  GLASSES_RULE_ENABLED,
  usvisaEyewearDetected: window.usvisaEyewearDetected,
  removeEyewearRequired
});
const shoulderRecoveryRequired =
 recoverable || Boolean(
    lockedDetection &&
    (
      lockedDetection.recoverable === true ||
      lockedDetection.shoulderLikelyCropped === true ||
      lockedDetection.upperBodyTooClose === true ||
      lockedDetection.compositionHardFail === true ||
      lockedDetection.failureReason === 'SHOULDERS_CROPPED'
    )
  );

formData.append(
  'shoulderRecoveryRequired',
  shoulderRecoveryRequired ? 'true' : 'false'
);

console.log('E.R.U SHOULDER RECOVERY:', {
  shoulderRecoveryRequired,
  recoverable: lockedDetection?.recoverable,
  shoulderLikelyCropped: lockedDetection?.shoulderLikelyCropped,
  upperBodyTooClose: lockedDetection?.upperBodyTooClose,
  compositionHardFail: lockedDetection?.compositionHardFail,
  failureReason: lockedDetection?.failureReason
});
const res = await fetch('/api/professional-retouch', {
  method: 'POST',
  body: formData,
});

      const data = await res.json();
   
if (!res.ok) {
  throw new Error(
    data && data.error
      ? data.error
      : "We couldn't process your photo. Please try again."
  );
}

if (!data.professionalPreview) {
  throw new Error('Professional preview image was not returned.');
}

const countryProfessionalPhoto =
  await createCountryProfessionalPhotoFromAi(data.professionalPreview);

const finalProfessionalJpg =
  await createFinalJpegWithSharp(countryProfessionalPhoto);

if (isLocalAdminEnvironment()) {
  localEruFinalJpg = finalProfessionalJpg;
}
const securedProfessionalPhoto = await protectPhotoForCheckout(finalProfessionalJpg);
const protectedProfessionalPreview = isLocalAdminEnvironment()
  ? await createProtectedProfessionalPreview(finalProfessionalJpg)
  : securedProfessionalPhoto.preview;

writeStoredPhoto('usvisa_pending_professional_photo', isLocalAdminEnvironment() ? finalProfessionalJpg : '');
writeStoredPhoto('usvisa_secure_professional_photo', securedProfessionalPhoto.token);
writeStoredPhoto('usvisa_pending_professional_protected_preview', protectedProfessionalPreview);

writeStoredPhoto(
  'usvisa_pending_professional_photo_fingerprint',
  currentPhotoFingerprint
);
writeStoredPhoto(
  'usvisa_pending_professional_photo_version',
  PROFESSIONAL_PREVIEW_VERSION
);

const selectedProfessionalExtraSizes =
  getSelectedProfessionalExtraSizes();

const securedProfessionalExtraPhotos = [];

for (
  const sizeKey of selectedProfessionalExtraSizes
) {
 const extraPhoto =
  await createProfessionalExtraPhotoFromAi(
    data.professionalPreview,
    sizeKey
  );

  if (!extraPhoto) {
    continue;
  }

  const securedExtra =
    await protectPhotoForCheckout(extraPhoto);

  if (
    !securedExtra ||
    !isSecurePhotoToken(securedExtra.token)
  ) {
    throw new Error(
      'Could not protect additional E.R.U photo: ' +
      sizeKey
    );
  }

  securedProfessionalExtraPhotos.push({
    sizeKey: sizeKey,
    token: securedExtra.token
  });
  if (isLocalAdminEnvironment()) {
  localEruExtraPhotos.push({
    sizeKey: sizeKey,
    url: extraPhoto
  });
}
}

/*
 * New multiple-extra storage.
 *
 * Do NOT store the clean image itself.
 * Only encrypted secure-photo tokens are stored.
 */
writeStoredPhoto(
  'usvisa_secure_professional_extra_photos',
  JSON.stringify(
    securedProfessionalExtraPhotos
  )
);

/*
 * Keep the old single-extra fields temporarily
 * for compatibility with existing code.
 */
const firstProfessionalExtra =
  securedProfessionalExtraPhotos.length
    ? securedProfessionalExtraPhotos[0]
    : null;

writeStoredPhoto(
  'usvisa_secure_professional_extra_photo',
  firstProfessionalExtra
    ? firstProfessionalExtra.token
    : ''
);

writeStoredPhoto(
  'usvisa_pending_professional_extra_size_key',
  firstProfessionalExtra
    ? firstProfessionalExtra.sizeKey
    : ''
);

writeStoredPhoto(
  'usvisa_pending_professional_international_photo',
  ''
);

if (!retouchImage) {
  throw new Error('Professional preview image element was not found.');
}

retouchImage.setAttribute('draggable', 'false');

retouchImage.oncontextmenu = function (e) {
  e.preventDefault();
  return false;
};

retouchImage.ondragstart = function (e) {
  e.preventDefault();
  return false;
};

retouchImage.onclick = function (e) {
  e.preventDefault();
  return false;
};

retouchImage.src = protectedProfessionalPreview;

try {
    await retouchImage.decode();

    console.log(
        "IMAGE SIZE =",
        retouchImage.naturalWidth,
        retouchImage.naturalHeight
    );
}
catch (imageError) {
    console.error(
        "PROFESSIONAL PREVIEW DECODE ERROR:",
        imageError
    );

    throw new Error(
        "Professional preview image could not be displayed."
    );
}
retouchImage.style.display = 'block';

if (retouchPreview) {
  retouchPreview.style.removeProperty('display');
  retouchPreview.classList.add('is-visible');
}
 // E.R.U preview is ready: Basic checkout must no longer be available.
// LOCAL TEST ONLY: download E.R.U final JPG + selected extra sizes.
if (downloadBtn) {
  if (isLocalAdminEnvironment() && localEruFinalJpg) {
    downloadBtn.style.display = 'block';
    downloadBtn.disabled = false;

    downloadBtn.textContent =
      localEruExtraPhotos.length > 0
        ? 'Download E.R.U Final + Selected Sizes'
        : 'Download E.R.U Final JPG';

    downloadBtn.onclick = async function (e) {
    console.log("=== ERU DOWNLOAD CLICKED ===", {
  localEruFinalJpgType: typeof localEruFinalJpg,
  localEruFinalJpgLength: localEruFinalJpg?.length,
  localEruFinalJpgStart: localEruFinalJpg?.slice(0, 50),
  extraPhotos: localEruExtraPhotos?.length
});
      e.preventDefault();
      e.stopPropagation();

      // Main E.R.U final
      const mainLink = document.createElement('a');
      mainLink.href = localEruFinalJpg;
      mainLink.download = 'USVisaPhoto-ERU-Final.jpg';

      document.body.appendChild(mainLink);
      mainLink.click();
      mainLink.remove();

      // Selected E.R.U extra sizes
      for (const item of localEruExtraPhotos) {
        await new Promise(function (resolve) {
          setTimeout(resolve, 300);
        });

        const extraLink = document.createElement('a');

        extraLink.href = item.url;
        extraLink.download =
          'USVisaPhoto-ERU-' +
          String(item.sizeKey).replace(/[^a-zA-Z0-9._-]/g, '-') +
          '.jpg';

        document.body.appendChild(extraLink);
        extraLink.click();
        extraLink.remove();
      }
    };
  } else {
    downloadBtn.style.display = 'none';
  }
}
  
 if (premiumCreateBtn) {
  if (isLocalAdminEnvironment() && localEruFinalJpg) {
    // LOCAL TEST:
    // E.R.U generation is complete, so do not show checkout.
    premiumCreateBtn.style.display = 'none';
    premiumCreateBtn.disabled = true;
  } else {
    const withInternational =
      professionalInternationalCheckbox &&
      professionalInternationalCheckbox.checked;

    premiumCreateBtn.style.display = 'block';
    premiumCreateBtn.disabled = false;

    premiumCreateBtn.textContent =
      withInternational
        ? '🔐 Unlock Embassy-Ready Photos · $12.99'
        : '🔐 Unlock Embassy-Ready Photo · $9.99';
  }
}

if (expertCard && professionalCard) {

    professionalCard.style.display = 'block';

    expertCard.style.display = 'block';

    markProfessionalPreviewUsedToday();

    professionalCard.insertAdjacentElement(
        'afterend',
        expertCard
    );
}

clearInterval(retouchTimer);
renderEruProgress(100, 'Embassy-Ready Upgrade complete');
professionalRetouchBtn.style.display = 'none';
 } catch (err) {
  clearInterval(retouchTimer);
  const errorMessage =
    err && err.message
      ? String(err.message)
      : 'Professional Preview failed.';
  const configurationMissing =
    errorMessage.indexOf('API_KEY') >= 0 ||
    errorMessage.toLowerCase().indexOf('missing credentials') >= 0;
  renderEruProgress(
    0,
    configurationMissing
      ? 'Upgrade service is not configured'
      : 'Upgrade could not finish — please try again'
  );
  console.error('Professional Retouch Error:', err);
  professionalRetouchBtn.style.display = 'block';
  statusEl.textContent =
    configurationMissing
      ? 'Embassy-Ready Upgrade requires its server API key. Add the key and restart the development server.'
      : errorMessage;
   } finally {
  professionalRetouchBusy = false;
  professionalPreviewLocked = false;
  if (professionalRetouchBtn.textContent !== 'Preview Ready') {
    applyProfessionalPreviewDailyState();
  }
}
  });
}



premiumCreateBtn?.addEventListener('click', async function () {
  const savedProfessionalPhoto =
    isLocalAdminEnvironment()
      ? readStoredPhoto('usvisa_pending_professional_photo')
      : readStoredPhoto('usvisa_secure_professional_photo');
  const withInternational =
    professionalInternationalCheckbox &&
    professionalInternationalCheckbox.checked;
  const checkoutProduct = withInternational
    ? 'professional-international'
    : 'professional';

  if (
    !savedProfessionalPhoto ||
    !isStoredProfessionalForCurrentPhoto()
  ) {
    statusEl.textContent =
      'Please create your Professional Preview before checkout.';
    premiumCreateBtn.disabled = false;
    updateProfessionalPackageButton();
    return;
  }

 
  if (
    withInternational &&
    (!isSecurePhotoToken(readStoredPhoto('usvisa_secure_professional_extra_photo')) || readStoredPhoto('usvisa_pending_professional_extra_size_key') !== getSelectedProfessionalExtraSize())
  ) {
    statusEl.textContent =
      'The selected extra size changed. Create the E.R.U preview again before checkout.';
    premiumCreateBtn.disabled = false;
    updateProfessionalPackageButton();
    return;
  }

  premiumCreateBtn.disabled = true;
  premiumCreateBtn.textContent = 'Opening checkout...';
  beginCheckoutForProduct(checkoutProduct);

  try {
    const response = await fetch('/api/create-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: withInternational
          ? 'professional-international'
          : 'professional',
        securePhotoTokens: getSecurePhotoTokens(checkoutProduct)
      })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'No checkout URL');
    }

    if (!rememberPendingPayment(checkoutProduct, data.url)) {
      throw new Error('Checkout could not be linked to this photo.');
    }

    window.parent.postMessage(
  {
    type: 'OPEN_PAYPAL_CHECKOUT',
    url: data.url
  },
  "*"
);
  } catch (error) {
    console.error('PROFESSIONAL CHECKOUT ERROR:', error);

    premiumCreateBtn.disabled = false;
    premiumCreateBtn.textContent =
      professionalInternationalCheckbox &&
      professionalInternationalCheckbox.checked
        ? '🔓 Unlock Embassy-Ready Photos · $12.99'
        : '🔓 Unlock Embassy-Ready Photo · $9.99';

    statusEl.textContent =
      'Payment page failed to open. Please try again.';
  }
});

expertEditBtn?.addEventListener('click', async function () {

    expertEditBtn.disabled = true;
    expertEditBtn.textContent = 'Opening checkout...';

    try {

        const response = await fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: 'expert'
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        }

    } catch (err) {

        console.error(err);

        expertEditBtn.disabled = false;
        expertEditBtn.textContent = 'Request Expert Editing · $19.99';
    }

});

downloadBtn.addEventListener('click', async function() {
  if (isLocalAdminEnvironment() && localEruFinalJpg) {
    return;
  }
  const searchParams = new URLSearchParams(
  window.parent.location.search
);

const isPaid = hasValidPaidReturn();
const paidProduct = getCurrentPaidProduct();

if (searchParams.get('paid') === '1' && !isPaid) {
  clearPaymentReturnParams();
  statusEl.textContent =
    'Payment confirmation is incomplete. Please open checkout again.';
  updateBasicPackageButton();
  return;
}

if (
  currentPhotoFingerprint &&
  !isCreatedPhotoForFingerprint(currentPhotoFingerprint)
) {
  clearPaymentState();
  resultUrl = null;
  statusEl.textContent =
    'This saved preview belongs to another photo. Please create this photo again.';
  setDownloadEnabled(false);
  updateBasicPackageButton();
  return;
}



if (isPaid) {
  const count = getPaidDownloadCount();
  const paidFiles = getPaidDownloadFiles(paidProduct);
  const missingLabels = getMissingPaidDownloadLabels(paidProduct);

  if (count >= MAX_PAID_DOWNLOADS) {
    statusEl.textContent =
      'Download limit reached. Please start a new order if needed.';

    setDownloadEnabled(false);
    downloadBtn.textContent = 'Download limit reached';
    return;
  }

  if (missingLabels.length) {
    statusEl.innerHTML = getPaidSuccessMessage(
      paidProduct,
      count
    );
    updatePaidDownloadButton(count, paidProduct);
    return;
  }

  try {
    const paymentReturn = getCurrentPaidReturnState();
    const secureResponse = await fetch('/api/download-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: paymentReturn && paymentReturn.orderId,
        product: paidProduct,
        tokens: paidFiles.map(function(file) { return file.url; })
      })
    });
    const secureData = await secureResponse.json();

    if (!secureResponse.ok || !Array.isArray(secureData.files) || secureData.files.length !== paidFiles.length) {
      throw new Error((secureData && secureData.error) || 'Payment verification failed.');
    }

    triggerPhotoDownloads(paidFiles.map(function(file, index) {
      return {
        url: secureData.files[index],
        filename: file.filename,
        label: file.label
      };
    }));
  } catch (secureDownloadError) {
    console.error('SECURE DOWNLOAD ERROR:', secureDownloadError);
    statusEl.textContent = 'Payment verification could not be completed. Please try the download again.';
    return;
  }

  const nextCount = count + 1;

  setPaidDownloadCount(nextCount);

  statusEl.innerHTML =
    getPaidSuccessMessage(paidProduct, nextCount);

  updatePaidDownloadButton(nextCount, paidProduct);
  return;
}

if (isLocalAdminEnvironment() && resultUrl) {
  const link = document.createElement('a');
  link.href = resultUrl;
  link.download = 'USVisaPhoto-Final.jpg';
  document.body.appendChild(link);
  link.click();
  link.remove();

  statusEl.textContent = 'Local test: Final clean JPG downloaded.';
  return;
}

  if (!resultUrl) {
    statusEl.textContent = 'Please create your photo first.';
    return;
  }

if (!isSecurePhotoToken(readStoredPhoto('usvisa_secure_basic_photo'))) {
    statusEl.textContent =
      'The clean JPG is still preparing. Please create your photo again.';
    updateBasicPackageButton();
    setDownloadEnabled(false);
    return;
  }

  setDownloadEnabled(false);
  downloadBtn.textContent = 'Opening checkout...';

  try {
    const selectedPackage = getSelectedBasicPackage();
    const checkoutProduct =
      selectedPackage === 'visa-plus-international'
        ? 'basic-international'
        : 'basic';

if (
  selectedPackage === 'visa-plus-international' &&
  (!isSecurePhotoToken(readStoredPhoto('usvisa_secure_basic_extra_photo')) || readStoredPhoto('usvisa_pending_extra_size_key') !== getSelectedBasicExtraSize())
) {
  statusEl.textContent =
    'The selected extra size changed. Create the Basic photo again before checkout.';
  updateBasicPackageButton();
  setDownloadEnabled(true);
  return;
}

beginCheckoutForProduct(checkoutProduct);

const response = await fetch('/api/create-paypal-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product:
      selectedPackage === 'visa-plus-international'
        ? 'basic-international'
        : 'basic',
    securePhotoTokens: getSecurePhotoTokens(checkoutProduct),
  }),
});
    const data = await response.json();
    if (!data.url) throw new Error('No checkout URL');

    if (!rememberPendingPayment(checkoutProduct, data.url)) {
      throw new Error('Checkout could not be linked to this photo.');
    }

    window.parent.postMessage(
  {
    type: "OPEN_PAYPAL_CHECKOUT",
    url: data.url
  },
  "*"
);
 } catch (error) {
  console.error(error);
  statusEl.textContent = 'Payment page failed to open. Please try again.';
  updateBasicPackageButton();
  setDownloadEnabled(true);
} finally {
  createPhotoBusy = false;
}
});
function restoreProfessionalPreviewIfAvailable() {
  const savedProfessionalPreview =
    readStoredPhoto('usvisa_pending_professional_protected_preview');
  const savedProfessionalAsset =
    readStoredPhoto('usvisa_secure_professional_photo') ||
    readStoredPhoto('usvisa_pending_professional_photo');

  if (
    !savedProfessionalPreview || !savedProfessionalAsset ||
    !isStoredProfessionalForCurrentPhoto() ||
    !retouchImage ||
    !retouchPreview
  ) {
    return;
  }

  retouchImage.src = savedProfessionalPreview;
console.log("RESTORE 1 SRC =", retouchImage.src);

retouchImage.style.display = 'block';

retouchPreview.style.removeProperty('display');
retouchPreview.classList.add('is-visible');

  if (professionalCard) {
    professionalCard.style.display = "block";
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.textContent = "Preview Ready";
    professionalRetouchBtn.disabled = true;
  }
}


function restorePaidDownloadIfAvailable(restoreMessage) {
  const clean = readStoredPhoto('usvisa_secure_basic_photo');
  const protectedPreview = readStoredPhoto('usvisa_protected_preview');
  if (!clean && !protectedPreview) return false;

  if (
    currentPhotoFingerprint &&
    (
      !isCreatedPhotoForFingerprint(currentPhotoFingerprint) ||
      !areCreatedPhotoFilesForCurrentPhoto()
    )
  ) {
    clearPaymentState();
    return false;
  }

  const img = new Image();
  img.onload = function() {
    canvas.width = TARGET;
    canvas.height = TARGET_HEIGHT;
    ctx.clearRect(0, 0, TARGET, TARGET_HEIGHT);
    ctx.drawImage(img, 0, 0, TARGET, TARGET_HEIGHT);
    canvas.style.display = 'block';
    if (resultPanel) resultPanel.style.display = 'block';
    if (uploadTips) uploadTips.style.display = 'none';
    downloadBtn.style.display = 'none';
    if (professionalCard) professionalCard.style.display = 'block';
    if (professionalRetouchBtn) {
      professionalRetouchBtn.style.display = 'block';
      applyProfessionalPreviewDailyState();
    }

    const savedProfessionalPreview =
  readStoredPhoto('usvisa_pending_professional_protected_preview');

if (
  savedProfessionalPreview &&
  isStoredProfessionalForCurrentPhoto() &&
  retouchImage &&
  retouchPreview
) {

retouchImage.src = savedProfessionalPreview;
console.log("RESTORE 2 SRC =", retouchImage.src);

retouchImage.style.display = 'block';

retouchPreview.style.removeProperty('display');
retouchPreview.classList.add('is-visible');

  if (professionalCard) {
    professionalCard.style.display = "block";
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.textContent = "Preview Ready";
  }
}

    resultUrl = protectedPreview || '';
    if (hasValidPaidReturn()) {
    const paidProduct = getCurrentPaidProduct();
    const downloadCount = getPaidDownloadCount();
    updatePaidDownloadButton(downloadCount, paidProduct);
    statusEl.innerHTML =
      getPaidSuccessMessage(
        paidProduct,
        downloadCount
      );

    clearPaymentReturnParams();

    if (
      hasAllPaidDownloadFiles(paidProduct) &&
      getRemainingPaidDownloads(downloadCount) > 0 &&
      !hasAutoDownloadedForCurrentPaidReturn()
    ) {
      statusEl.textContent = 'Payment confirmed. Press Download when you are ready to save your files.';
    }
} else {
   updateBasicPackageButton();
    statusEl.textContent =
        restoreMessage ||
        'Preview restored. Unlock download to receive the clean photo.';
    setDownloadEnabled(true);
}
  };
  img.src = protectedPreview;
  return true;
}

setCreateEnabled(false);
setDownloadEnabled(false);

const paymentInterruption = getPaymentInterruptionFromUrl();

if (paymentInterruption) {
  clearInterruptedPaymentState();

  if (
    !restorePaidDownloadIfAvailable(paymentInterruption.message) &&
    statusEl
  ) {
    statusEl.textContent = paymentInterruption.message;
    updateBasicPackageButton();
  }
} else if (hasValidPaidReturn()) {
  restorePaidDownloadIfAvailable();
} else if (
  new URLSearchParams(window.parent.location.search).get('paid') === '1'
) {
  clearPaymentReturnParams();
}
`;
