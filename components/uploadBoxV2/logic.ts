export const uploadBoxLogic = String.raw`
const fileInput = document.getElementById('file-input');
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
const professionalInternationalCheckbox = document.getElementById('professional-international-checkbox');
const basicPackageNote = document.getElementById('basic-package-note');
const expertEditBtn = document.getElementById('expert-edit-btn');
const canvas = document.getElementById('result-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');
const statusEl = document.getElementById('status');
const resultPanel = document.getElementById('resultPanel');
const uploadTips = document.getElementById('uploadTips');
const validationCard = document.getElementById('validation-card');
const checkFace = document.getElementById('check-face');
const checkEyes = document.getElementById('check-eyes');
const checkMouth = document.getElementById('check-mouth');
const checkGlasses = document.getElementById('check-glasses');
const checkPosition = document.getElementById('check-position');
const validationFinal = document.getElementById('validation-final');
const professionalCard = document.getElementById('professional-retouch-card');
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

  return selected && selected.value === 'visa-plus-international'
    ? 'visa-plus-international'
    : 'visa-only';
}

function updateProfessionalPackageButton() {
  const checkbox =
    document.getElementById('professional-international-checkbox');

  const withInternational =
    checkbox && checkbox.checked;

  if (premiumCreateBtn) {
    premiumCreateBtn.textContent =
      withInternational
        ? '🔓 Unlock Professional Photos · $12.99'
        : '🔓 Unlock Professional Photo · $9.99';
  }
}

const professionalInternationalOption =
  document.getElementById('professional-international-checkbox');

if (professionalInternationalOption) {
  professionalInternationalOption.addEventListener(
    'change',
    updateProfessionalPackageButton
  );
}

updateProfessionalPackageButton();
function setBasicPackageSelection(packageName) {
  if (
    packageName !== 'visa-only' &&
    packageName !== 'visa-plus-international'
  ) {
    return;
  }

  photoTypeInputs.forEach(function (input) {
    input.checked = input.value === packageName;
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

if (hasValidPaidReturn()) {
  const paidProduct = getCurrentPaidProduct();
  syncBasicPackageUiForPaidProduct(paidProduct);
  updatePaidDownloadButton(
    getPaidDownloadCount(),
    paidProduct
  );
  return;
}

  const selected = getSelectedBasicPackage();

  downloadBtn.textContent =
    selected === 'visa-plus-international'
      ? '🔓 Unlock Both Photo Sizes · $7.99'
      : '🔓 Unlock HD Photo · $4.99';

  updateBasicPackageHelpPanels(selected);
}

updateProfessionalPackageButton();

photoTypeInputs.forEach(function (input) {
  input.addEventListener('change', updateBasicPackageButton);
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

const TARGET = 600;
const PHOTO_CM = 5.08;
const HEAD_CM = 2.8;
const TARGET_HEAD_PX = TARGET * (HEAD_CM / PHOTO_CM);
const TOP_MARGIN_CM = 0.55;
const TOP_MARGIN_PX = TARGET * (TOP_MARGIN_CM / PHOTO_CM);

let guideMode = 'auto';
let uploadedFile = null;
let uploadedImg = null;
let bgRemovedImg = null;
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
  detectBtn.textContent = 'REVIEW';
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
    storedAutoDetect.status === 'pass' &&
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
        '<div ...>' +
        message +
        '</div>';

if (validationFinal) {
  validationFinal.innerHTML = errorHtml;
}

statusEl.textContent = 'Photo validation failed. Please check the message below.';
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

  if (resultPanel) {
    resultPanel.style.display = "block";
  }

  setBasicPhotoSectionVisible(false);

if (professionalCard) {
  professionalCard.style.display = "block";
}

if (expertCard) {
  expertCard.style.display = "block";
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

      '<div style="color:#047857;font-weight:700;">' +
        '✓ Embassy-Ready Upgrade can automatically reconstruct ' +
        'missing shoulders and upper body.' +
      '</div>';
if (detectBtn) {
  detectBtn.disabled = false;
  detectBtn.textContent = "2. Embassy-Ready Upgrade · $9.99";
  detectBtn.style.background = "#f59e0b";
  detectBtn.style.color = "#ffffff";
  detectBtn.style.cursor = "pointer";

  detectBtn.onclick = function (event) {
    event.preventDefault();

    if (!premiumCreateBtn) {
      console.error("Embassy-Ready Upgrade button was not found.");
      return;
    }

    if (!professionalRetouchBtn) {
  console.error("Embassy-Ready Upgrade preview button was not found.");
  return;
}

professionalCard.scrollIntoView({
  behavior: "smooth",
  block: "center"
});

setTimeout(() => {
  professionalRetouchBtn.click();
}, 400);
  };
}

if (createBtn) {
  createBtn.style.display = "none";
}
  }
  } 

function showValidationExpertOnly(message) {
  if (resultPanel) {
    resultPanel.style.display = 'block';
  }

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
    storedAutoDetect.status === 'pass' &&
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
    storedAutoDetect.status === 'recoverable' &&
    storedAutoDetect.detection
  ) {
    lockedDetection = storedAutoDetect.detection;
    lockedDetectionFingerprint = currentPhotoFingerprint || '';
    faceTiltAngle = lockedDetection.faceTiltAngle || 0;
    window.usvisaRecoverable = true;

    photoValidationPassed = false;
    autoDetectLocked = true;

    showValidationRecoverable(
      storedAutoDetect.message ||
      'This photo is eligible for Embassy-Ready Upgrade or Expert Manual Editing.'
    );

    setDetectButtonState('warning');
    setCreateEnabled(false);

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
      'Auto detection restored. This photo is eligible for Embassy-Ready Upgrade or Expert Manual Editing.';

    return true;
  }

  if (storedAutoDetect.status === 'expert-only') {
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

  if (storedAutoDetect.status === 'deny') {
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
  window.parent.localStorage.removeItem('usvisa_created_photo_files_fingerprint');
  window.parent.localStorage.removeItem('usvisa_pending_professional_photo_fingerprint');
  window.parent.localStorage.removeItem('usvisa_created_photo_fingerprint');
  window.parent.localStorage.removeItem(PENDING_PAYMENT_KEY);
  window.parent.localStorage.removeItem(ACTIVE_PAYMENT_RETURN_KEY);
  clearConfirmedPaymentStates();
  clearPaymentReturnParams();
}

function readStoredPhoto(key) {
  return window.parent.localStorage.getItem(key) || '';
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
      return [
        'Professional Retouched U.S. Visa Photo'
      ];
    case 'professional-international':
      return [
        'Professional Retouched U.S. Visa Photo',
        'Professional International 3.5 × 4.5 cm Photo'
      ];
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
  switch (fileType) {
    case 'basic-us':
      return 'usvisaphoto_us_visa_2x2.jpg';
    case 'basic-international':
      return 'usvisaphoto_international_35x45.jpg';
    case 'professional-us':
      return 'usvisaphoto_professional_us_visa_2x2.jpg';
    case 'professional-international':
      return 'usvisaphoto_professional_international_35x45.jpg';
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

  const cleanPhoto = getCleanPhotoForDownload();
  const internationalPhoto =
    readStoredPhoto('usvisa_pending_international_photo');
  const professionalPhoto =
    readStoredPhoto('usvisa_pending_professional_photo');
  const professionalInternationalPhoto =
    readStoredPhoto('usvisa_pending_professional_international_photo');

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
    case 'professional':
      return [
        {
          url: professionalPhoto,
          filename: getPaidDownloadFilename('professional-us'),
          label: 'Professional Retouched U.S. Visa Photo'
        }
      ];
    case 'professional-international':
      return [
        {
          url: professionalPhoto,
          filename: getPaidDownloadFilename('professional-us'),
          label: 'Professional Retouched U.S. Visa Photo'
        },
        {
          url: professionalInternationalPhoto,
          filename: getPaidDownloadFilename('professional-international'),
          label: 'Professional International 3.5 × 4.5 cm Photo'
        }
      ];
    default:
      return [
        {
          url: cleanPhoto,
          filename: getPaidDownloadFilename('basic-us'),
          label: 'HD U.S. Visa Photo'
        }
      ];
  }
}

function getMissingPaidDownloadLabels(product) {
  return getPaidDownloadFiles(product)
    .filter(function (file) {
      return !isFinalJpegPhoto(file.url);
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

  return storedFingerprint === currentPhotoFingerprint;
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

  if (savedCleanPhoto) {
    resultUrl = savedCleanPhoto;
  }

  if (!canvas) {
    console.error(
      'RESTORE ERROR: result canvas not found.'
    );
    return false;
  }

  canvas.width = TARGET;
  canvas.height = TARGET;
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

  if (downloadBtn && savedCleanPhoto) {
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
      previewCanvas.height = TARGET;

      const pctx = previewCanvas.getContext('2d');

      pctx.drawImage(img, 0, 0, TARGET, TARGET);

    // Embassy Ready Badge
const badgeX = 12;
const badgeY = 12;
const badgeW = 180;
const badgeH = 58;

pctx.save();

// 배경
pctx.fillStyle = '#14866d';
pctx.fillRect(12, 12, 180, 58);

// 첫 줄
pctx.fillStyle = '#ffffff';
pctx.font = 'bold 18px Arial';
pctx.fillText('US Embassy-Ready', badgeX + 14, badgeY + 24);

// 둘째 줄
pctx.font = '15px Arial';
pctx.fillText('2×2 inch • 300 DPI', badgeX + 14, badgeY + 45);

pctx.restore();

      resolve(previewCanvas.toDataURL('image/png'));
    };

    img.onerror = reject;
    img.src = src;
  });
}
function resetForNewUpload() {
  setBasicPhotoSectionVisible(true);

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
  window.usvisaGlassesUpgrade = false;
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
    await createPhotoFingerprint(file);

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
 if (checkGlasses) {
  const glassesDetected =
    validation.failureReason === 'glasses' ||
    validation.failureReason === 'glassesAndTeeth';

  checkGlasses.textContent =
    glassesDetected
      ? '🔴 Glasses are not allowed'
      : '🟢 No glasses detected';
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

   if (
  validation.failureReason === 'glassesAndTeeth' ||
  validation.failureReason === 'glasses'
) {
  window.usvisaGlassesUpgrade = true;
  validation.eruGlasses = true;
  return validation;
}
  
    if (validation.failureReason === 'glasses') {
      showValidationError(
        '❌ Glasses are not allowed for a standard U.S. visa photo.<br><br>2. Embassy-Ready Upgrade can remove the glasses and restore the eye area naturally.<br>Preview available before payment.'
      );
      window.usvisaGlassesUpgrade = true;
      validation.eruGlasses = true;
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
    'This photo is cropped too tightly for Basic Photo creation.<br><br>' +
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

  clearCreatedPhotoState(currentPhotoFingerprint);
  clearPaymentState();
  lockedDetection = null;
  detectedLm = null;
  lockedDetectionFingerprint = '';
  photoValidationPassed = false;
  window.usvisaRecoverable = false;
  window.usvisaGlassesUpgrade = false;
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

if (validation.eruGlasses === true) {
  lockedDetection = {
    landmarks: lm,
    iw,
    ih,

    imageWidth: iw,
    imageHeight: ih,

    faceTiltAngle,

    crownY: Number.isFinite(validation.layoutCrownY)
      ? validation.layoutCrownY
      : validation.estimatedCrownY,
    chinY: validation.detectedChinY,

    foreheadY: validation.foreheadY,
    faceHeight: validation.faceHeight
  };

  lockedDetectionFingerprint = currentPhotoFingerprint || '';
  photoValidationPassed = false;
  autoDetectLocked = true;
  window.usvisaRecoverable = true;

  const glassesReviewMessage =
    'Glasses detected.<br><br>' +
    'Basic Photo is unavailable with glasses.<br><br>' +
    '<strong>Continue with 2. Embassy-Ready Upgrade to remove them.</strong><br>' +
    'Preview available before payment.';

  saveAutoDetectRecoverable(
    currentPhotoFingerprint,
    lockedDetection,
    glassesReviewMessage
  );

  showValidationRecoverable(glassesReviewMessage);
  setDetectButtonState('warning');
  setCreateEnabled(false);

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
    'Glasses detected. Continue with Embassy-Ready Upgrade.';

  if (professionalCard) {
    setTimeout(function () {
      professionalCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 150);
  }

  return;
}

if (poseRecoverable && validation.pass) {
    validation.pass = false;
    validation.failureReason = "professionalRecoverable";
}

lockedDetection = {
  landmarks: lm,
  iw,
  ih,

  imageWidth: iw,
  imageHeight: ih,

  faceTiltAngle,

  crownY: Number.isFinite(validation.layoutCrownY)
  ? validation.layoutCrownY
  : validation.estimatedCrownY,
  chinY: validation.detectedChinY,

  foreheadY: validation.foreheadY,
  faceHeight: validation.faceHeight
};
lockedDetectionFingerprint = currentPhotoFingerprint || '';

const sourceForm = new FormData();
sourceForm.append('image', uploadedFile);

let sourceType = 'UNCERTAIN';

try {
  const sourceResponse = await fetch('/api/source-photo-check', {
    method: 'POST',
    body: sourceForm
  });

  if (sourceResponse.ok) {
    const sourceResult = await sourceResponse.json();
    sourceType = sourceResult && sourceResult.source
      ? sourceResult.source
      : 'UNCERTAIN';
  } else {
    console.error(
      'SOURCE PHOTO CHECK ERROR:',
      await sourceResponse.text()
    );
  }
} catch (sourceError) {
  console.error('SOURCE PHOTO CHECK ERROR:', sourceError);
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

if (validation.eruGlasses === true) {
  window.usvisaRecoverable = true;
  window.usvisaGlassesUpgrade = true;
  photoValidationPassed = false;
  autoDetectLocked = true;

  const glassesUpgradeMessage =
    'Glasses are not allowed for a standard U.S. visa photo.<br><br>' +
    '2. Embassy-Ready Upgrade can remove the glasses and restore the eye area naturally.<br><br>' +
    'Preview the upgraded result before payment.';

  saveAutoDetectRecoverable(
    currentPhotoFingerprint,
    lockedDetection,
    glassesUpgradeMessage
  );

  showValidationRecoverable(glassesUpgradeMessage);
  setDetectButtonState('warning');
  setCreateEnabled(false);

  if (createBtn) {
    createBtn.style.display = 'none';
  }

  if (professionalCard) {
    professionalCard.style.display = 'block';
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.style.display = 'block';
    professionalRetouchBtn.querySelector('.professional-preview-button-title').textContent =
      'Preview Glasses Removal';
    applyProfessionalPreviewDailyState();
  }

  if (expertCard) {
    expertCard.style.display = 'block';
  }

  statusEl.textContent =
    'Glasses detected. Continue with 2. Embassy-Ready Upgrade.';

  setTimeout(function () {
    if (professionalCard) {
      professionalCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, 250);

  return;
}

if (poseRecoverable) {
  window.usvisaRecoverable = true;

  const recoverableMessage =
    'This photo is cropped too tightly for Basic Photo creation.<br><br>' +
    'Professional Retouch can extend the clothing and shoulder area automatically.';

  photoValidationPassed = false;
  autoDetectLocked = true;

  saveAutoDetectRecoverable(
    currentPhotoFingerprint,
    lockedDetection,
    recoverableMessage
  );

  showValidationRecoverable(
    recoverableMessage
  );

  setDetectButtonState('warning');
  setCreateEnabled(false);

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
    'This photo is eligible for Embassy-Ready Upgrade or Expert Manual Editing.';

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
    showValidationError('❌ Auto detect failed.<br>Please try another photo.');
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

function drawFinalPhoto(sourceImg) {
  if (!lockedDetection) throw new Error('No locked detection.');

  const crownY = lockedDetection.crownY;
  const chinY = lockedDetection.chinY;

  if (!Number.isFinite(crownY) || !Number.isFinite(chinY) || chinY <= crownY) {
    throw new Error('Invalid locked crown/chin geometry.');
  }

  const currentHeadPx = Math.max(1, chinY - crownY);
 const scale = (TARGET_HEAD_PX * 0.9) / currentHeadPx;

  const sourceWidth = sourceImg.naturalWidth || sourceImg.width;
  const centerX = sourceWidth / 2;

  const finalCenterX = getFaceCenterX(
    lockedDetection.landmarks,
    sourceWidth,
    centerX
  );

  canvas.width = TARGET;
  canvas.height = TARGET;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, TARGET, TARGET);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARGET, TARGET);

  ctx.save();
  ctx.translate(TARGET / 2, TOP_MARGIN_PX + 32);
  ctx.rotate(-lockedDetection.faceTiltAngle);
  ctx.scale(scale, scale);
  ctx.drawImage(sourceImg, -finalCenterX, -crownY);
  ctx.restore();


 drawOverlayGuide();
  return canvas.toDataURL('image/jpeg', 0.99);
}
  function drawOverlayGuide() {

  if (!overlayCanvas) return;

  overlayCanvas.width = canvas.width;
  overlayCanvas.height = canvas.height;

  overlayCanvas.style.display = "block";

  const octx = overlayCanvas.getContext("2d");

  const W = overlayCanvas.width;
  const H = overlayCanvas.height;

  octx.clearRect(0,0,W,H);

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
  headTop + TARGET_HEAD_PX * 0.9;

const faceHeightPx =
    headBottom - headTop;

const faceHeightIn =
    (faceHeightPx / TARGET) * 2;

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
      faceHeightIn.toFixed(2) + " in",
      measureX-10,
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
      "2 in",
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
      "2 in",
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
 

// 여기에 전체 함수 붙여넣기
async function createProfessionalAlignedPhoto(sourceInput) {

  if (!lockedDetection) {
    throw new Error(
      'No locked detection for professional alignment.'
    );
  }

  const professionalCanvas =
    document.createElement('canvas');

  professionalCanvas.width = TARGET;
  professionalCanvas.height = TARGET;

  const professionalCtx =
    professionalCanvas.getContext('2d');

  if (!professionalCtx) {
    throw new Error(
      'Professional alignment canvas context unavailable.'
    );
  }

  const sourceWidth =
    sourceImg.naturalWidth || sourceImg.width;

  const sourceCenterX = sourceWidth / 2;

  const detectedFaceCenterX = getFaceCenterX(
    lockedDetection.landmarks,
    sourceWidth,
    sourceCenterX
  );

  const currentHeadPx = Math.max(
    1,
    lockedDetection.chinY -
      lockedDetection.crownY
  );

  const scale =
    (TARGET_HEAD_PX * 0.9) /
    currentHeadPx;

  const maxCorrectionPx = 18;

  const correctionX = Math.max(
    -maxCorrectionPx,
    Math.min(
      maxCorrectionPx,
      (detectedFaceCenterX -
        sourceCenterX) *
        scale
    )
  );

  professionalCtx.fillStyle = '#ffffff';
  professionalCtx.fillRect(
    0,
    0,
    TARGET,
    TARGET
  );

  professionalCtx.save();

  professionalCtx.translate(
    TARGET / 2 + correctionX,
    TOP_MARGIN_PX + 32
  );

  professionalCtx.rotate(
    -lockedDetection.faceTiltAngle
  );

  professionalCtx.scale(scale, scale);

  professionalCtx.drawImage(
    sourceImg,
    -detectedFaceCenterX,
    -lockedDetection.crownY
  );

  professionalCtx.restore();

  enhanceCanvas(
    professionalCtx,
    TARGET,
    TARGET
  );

  return professionalCanvas.toDataURL(
    'image/jpeg',
    0.99
  );
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
    Number.isFinite(
      Number(
        lockedDetection.faceTiltAngle
      )
    )
      ? Number(
          lockedDetection.faceTiltAngle
        )
      : 0;

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

async function createInternationalPhotoFromResult(sourceUrl) {
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
  const usCanvasSize = 600;
  const usPhysicalHeightMm = 50.8;
  const usTopMarginMm = 5;
  const usHeadLengthMm = 28;

  const usCrownY =
    usCanvasSize *
    (
      usTopMarginMm /
      usPhysicalHeightMm
    );

  const usHeadHeightPx =
    usCanvasSize *
    (
      usHeadLengthMm /
      usPhysicalHeightMm
    );

  const usChinY =
    usCrownY +
    usHeadHeightPx;

  return await window.createProfessionalPhotoLayout({
    sourceInput: sourceUrl,

    format: 'international',

    crownY: usCrownY,
    chinY: usChinY,

    faceCenterX:
      usCanvasSize / 2,

    /*
     * 미국 Professional 사진을 만들 때
     * 이미 기울기 보정이 끝났으므로 0을 사용한다.
     */
    faceTiltAngle: 0,
  });
}
async function createInternationalPhotoFromResult(sourceUrl) {
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

  const usCanvasSize = 600;
  const usPhysicalHeightMm = 50.8;
  const usTopMarginMm = 5;
  const usHeadLengthMm = 28;

  const usCrownY =
    usCanvasSize *
    (usTopMarginMm / usPhysicalHeightMm);

  const usHeadHeightPx =
    usCanvasSize *
    (usHeadLengthMm / usPhysicalHeightMm);

  const usChinY =
    usCrownY + usHeadHeightPx;

  return await window.createProfessionalPhotoLayout({
    sourceInput: sourceUrl,

    format: 'international',

    crownY: usCrownY,
    chinY: usChinY,

    faceCenterX:
      usCanvasSize / 2,

    faceTiltAngle: 0,
  });
}

let createPhotoBusy = false;

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
    resultUrl = cleanUrl;
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
    
  const internationalPhoto =
    await createInternationalPhotoFromResult(cleanUrl);

  writeStoredPhoto(
    'usvisa_pending_international_photo',
    internationalPhoto
  );
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

    writeStoredPhoto('usvisa_clean_photo', cleanUrl);
    downloadBtn.dataset.downloadCount = '0';
    setPhotoDownloadCount(0);

    const protectedCanvas = document.createElement('canvas');
    protectedCanvas.width = TARGET;
    protectedCanvas.height = TARGET;
    const pctx = protectedCanvas.getContext('2d');

    const finalPreview = new Image();

    await new Promise(function(resolve, reject) {
      finalPreview.onload = resolve;
      finalPreview.onerror = reject;
      finalPreview.src = cleanUrl;
    });

    pctx.drawImage(finalPreview, 0, 0);
    applyPreviewProtection(pctx, TARGET, TARGET);
    

    writeStoredPhoto(
      'usvisa_protected_preview',
     protectedCanvas.toDataURL('image/png')
    );

    markCreatedPhotoFilesForCurrentPhoto();

    ctx.clearRect(0, 0, TARGET, TARGET);
    ctx.drawImage(protectedCanvas, 0, 0);
    

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

downloadBtn.style.display = 'inline-flex';
    if (uploadTips) uploadTips.style.display = 'none';

    downloadBtn.style.display = 'inline-flex';
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

   const savedProfessionalPhoto =
    readStoredPhoto('usvisa_pending_professional_photo');

  if (
    hasUsedProfessionalPreviewToday() &&
    savedProfessionalPhoto &&
    isStoredProfessionalForCurrentPhoto()
  ) {
    if (retouchImage) {
      const protectedProfessionalPreview =
        await createProtectedProfessionalPreview(
          savedProfessionalPhoto
        );

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


let retouchCountdown = 75;
professionalRetouchBtn.textContent =  'Preparing preview... about 60–75s';

const retouchTimer = setInterval(function () {
  retouchCountdown -= 1;

  if (retouchCountdown > 0) {
  professionalRetouchBtn.textContent =
    'Preparing preview... about ' + retouchCountdown + 's';
} else {
  professionalRetouchBtn.textContent = 'Finalizing your preview...';
}

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
      storedAutoDetect.status === 'pass' ||
      storedAutoDetect.status === 'recoverable'
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
      storedAutoDetect.status === 'recoverable';
  } else {
    throw new Error(
      'Face measurements are not available. Please run Auto Detect again.'
    );
  }
}

if (!bgRemovedImg) {
  statusEl.textContent =
    'Preparing your Embassy-Ready Upgrade preview...';

  bgRemovedImg =
    await removeBackgroundWithPhotoRoom();
}

const recoverable =
  window.usvisaRecoverable === true;

if (recoverable) {
  statusEl.textContent =
    'Embassy-Ready Upgrade will reconstruct the missing shoulder area.';
}

const sourceImage =
  recoverable
    ? uploadedImg?.src
    : (
        typeof bgRemovedImg === 'string'
          ? bgRemovedImg
          : bgRemovedImg?.src || uploadedImg?.src
      );

console.log('Recoverable:', recoverable);
console.log('SOURCE IMAGE:', sourceImage);

if (!sourceImage || typeof sourceImage !== 'string') {
  throw new Error(
    'Professional Retouch source image could not be prepared.'
  );
}


const professionalAlignedUrl =
  await createProfessionalAlignedPhoto(sourceImage);

const professionalBlob =
  await fetch(professionalAlignedUrl).then((res) =>
    res.blob()
  );

const formData = new FormData();

console.log(
  'ERU GLASSES REQUEST',
  {
    usvisaGlassesUpgrade: window.usvisaGlassesUpgrade,
    removeGlasses:
      window.usvisaGlassesUpgrade === true
        ? 'true'
        : 'false'
  }
);


formData.append(
  'image',
  professionalBlob,
  'professional-aligned-photo.jpg'
);

formData.append(
  'removeGlasses',
  window.usvisaGlassesUpgrade === true ? 'true' : 'false'
);
const res = await fetch('/api/professional-retouch', {
  method: 'POST',
  body: formData,
});

      const data = await res.json();
   
     if (!res.ok) {
 throw new Error("We couldn't process your photo. Please try again.");
 }

if (!data.professionalPreview) {
  throw new Error('Professional preview image was not returned.');
}

const finalProfessionalJpg =
  await createFinalJpegWithSharp(data.professionalPreview);

const protectedProfessionalPreview =
  await createProtectedProfessionalPreview(finalProfessionalJpg);

writeStoredPhoto(
  'usvisa_pending_professional_photo',
  finalProfessionalJpg
);

writeStoredPhoto(
  'usvisa_pending_professional_photo_fingerprint',
  currentPhotoFingerprint
);

const professionalInternationalPhoto =
  await createInternationalPhotoFromResult(finalProfessionalJpg);

writeStoredPhoto(
  'usvisa_pending_professional_international_photo',
  professionalInternationalPhoto
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
  if (premiumCreateBtn) {
  const withInternational =
    professionalInternationalCheckbox &&
    professionalInternationalCheckbox.checked;

  premiumCreateBtn.style.display = 'block';
  premiumCreateBtn.disabled = false;

  premiumCreateBtn.textContent =
    withInternational
      ? '🔓 Unlock Professional Photos · $12.99'
      : '🔓 Unlock Professional Photo · $9.99';
}

updateAdminProfessionalDownloadButton();

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
professionalRetouchBtn.style.display = 'none';
 } catch (err) {
  clearInterval(retouchTimer);
  console.error('Professional Retouch Error:', err);
  professionalRetouchBtn.style.display = 'block';
  statusEl.textContent =
    'Professional Preview failed. Please try again shortly.';
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
    readStoredPhoto('usvisa_pending_professional_photo');
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
    !isFinalJpegPhoto(
      readStoredPhoto('usvisa_pending_professional_international_photo')
    )
  ) {
    statusEl.textContent =
      'Professional international photo is still preparing. Please try again shortly.';
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
          : 'professional'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'No checkout URL');
    }

    if (!rememberPendingPayment(checkoutProduct, data.url)) {
      throw new Error('Checkout could not be linked to this photo.');
    }

    window.parent.location.href = data.url;
  } catch (error) {
    console.error('PROFESSIONAL CHECKOUT ERROR:', error);

    premiumCreateBtn.disabled = false;
    premiumCreateBtn.textContent =
      professionalInternationalCheckbox &&
      professionalInternationalCheckbox.checked
        ? '🔓 Unlock Professional Photos · $12.99'
        : '🔓 Unlock Professional Photo · $9.99';

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

  triggerPhotoDownloads(paidFiles);

  const nextCount = count + 1;

  setPaidDownloadCount(nextCount);

  statusEl.innerHTML =
    getPaidSuccessMessage(paidProduct, nextCount);

  updatePaidDownloadButton(nextCount, paidProduct);
  return;
}

  if (!resultUrl) {
    statusEl.textContent = 'Please create your photo first.';
    return;
  }

  if (!isFinalJpegPhoto(getCleanPhotoForDownload())) {
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
  !isFinalJpegPhoto(
    readStoredPhoto('usvisa_pending_international_photo')
  )
) {
  statusEl.textContent =
    'The international 3.5 × 4.5 cm JPG is still preparing. Please try again shortly.';
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
  }),
});
    const data = await response.json();
    if (!data.url) throw new Error('No checkout URL');

    if (!rememberPendingPayment(checkoutProduct, data.url)) {
      throw new Error('Checkout could not be linked to this photo.');
    }

    window.parent.location.href = data.url;
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
    readStoredPhoto('usvisa_pending_professional_photo');

  if (
    !savedProfessionalPreview ||
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
  const clean = readStoredPhoto('usvisa_clean_photo');
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
    canvas.height = TARGET;
    ctx.clearRect(0, 0, TARGET, TARGET);
    ctx.drawImage(img, 0, 0);
    canvas.style.display = 'block';
    if (resultPanel) resultPanel.style.display = 'block';
    if (uploadTips) uploadTips.style.display = 'none';
    downloadBtn.style.display = 'inline-flex';

    const savedProfessionalPreview =
  readStoredPhoto('usvisa_pending_professional_photo');

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

    resultUrl = clean || '';
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
      markAutoDownloadedForCurrentPaidReturn();
      setTimeout(function () {
        downloadBtn.click();
      }, 250);
    }
} else {
   updateBasicPackageButton();
    statusEl.textContent =
        restoreMessage ||
        'Preview restored. Unlock download to receive the clean photo.';
    setDownloadEnabled(true);
}
  };
  img.src = hasValidPaidReturn() && clean ? clean : protectedPreview;
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
