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
const tempDownloadBtn = document.getElementById('temp-download-btn');
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
function updateBasicPackageButton() {
  if (!downloadBtn) return;

  const currentParams = new URLSearchParams(
  window.parent.location.search
);

if (currentParams.get('paid') === '1') {
  downloadBtn.textContent = 'Download Photo';
  downloadBtn.disabled = false;
  setDownloadEnabled(true);
  return;
}

  const selected = getSelectedBasicPackage();

  downloadBtn.textContent =
    selected === 'visa-plus-international'
      ? '🔓 Unlock Both Photo Sizes · $7.99'
      : '🔓 Unlock HD Photo · $4.99';

  if (basicPackageNote) {
    basicPackageNote.style.display =
      selected === 'visa-only'
        ? 'block'
        : 'none';
  }

  if (internationalPackageInfo) {
    internationalPackageInfo.style.display =
      selected === 'visa-plus-international'
        ? 'block'
        : 'none';
  }

  if (internationalPhotoWarning) {
    internationalPhotoWarning.style.display =
      selected === 'visa-plus-international'
        ? 'block'
        : 'none';
  }
}

updateProfessionalPackageButton();



  const selected = getSelectedBasicPackage();

  downloadBtn.textContent =
    selected === 'visa-plus-international'
      ? '🔓 Unlock Both Photo Sizes · $7.99'
      : '🔓 Unlock HD Photo · $4.99';

      if (basicPackageNote) {
  basicPackageNote.style.display =
    selected === 'visa-only'
      ? 'block'
      : 'none';
}

if (internationalPackageInfo) {
  internationalPackageInfo.style.display =
    selected === 'visa-plus-international'
      ? 'block'
      : 'none';
}

if (internationalPhotoWarning) {
  internationalPhotoWarning.style.display =
    selected === 'visa-plus-international'
      ? 'block'
      : 'none';
}



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
autoDetectLocked = false;

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
 console.trace("showValidationReady");
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className = 'validation-card validation-success';
  }setCreateEnabled(true);
setDetectButtonState('success');

  const report = window.usvisaLastValidationReport || {
    score: 98,
    headSizeText: 'Head size checked',
    centerText: 'Face centered',
    originalText: 'Original photo check passed'
  };

  if (checkFace) checkFace.textContent = '🟢 Face detected';
  if (checkEyes) checkEyes.textContent = '🟢 Eyes open';
  if (checkMouth) checkMouth.textContent = '🟢 Mouth closed';
  if (checkGlasses) checkGlasses.textContent = '🟢 No glasses detected';
  if (checkPosition) checkPosition.textContent = '🟢 ' + report.originalText;

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

setDetectButtonState('success');

statusEl.innerHTML =
  '✅ Auto detection completed.<br>Please review the validation report before creating your photo.';

setCreateEnabled(true);

autoDetectLocked = true;

setDetectButtonState('success');

statusEl.innerHTML =
  '✅ Auto detection completed.<br>Please review the validation report before creating your photo.';

setCreateEnabled(true);

 function showValidationRecoverable(message) {
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
        '✓ Professional Retouch can automatically reconstruct ' +
        'missing shoulders and upper body.' +
      '</div>';
  }
}
  return bgRemovedImg || uploadedImg;
}

function getCurrentImage() {
  return bgRemovedImg || uploadedImg;
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
  function clearPaymentState() {
  window.parent.localStorage.removeItem('usvisa_clean_photo');
  window.parent.localStorage.removeItem('usvisa_download_count');
  window.parent.localStorage.removeItem('usvisa_pending_clean_photo');
  window.parent.localStorage.removeItem('usvisa_protected_preview');
  
}
function getPhotoState() {
  try {
    return JSON.parse(
      window.parent.localStorage.getItem("usvisa_photo_state") || "{}"
    );
  } catch {
    return {};
  }
}

function savePhotoState(state) {
  window.parent.localStorage.setItem(
    "usvisa_photo_state",
    JSON.stringify(state)
  );
}

function clearPhotoState() {
  window.parent.localStorage.removeItem("usvisa_photo_state");
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
  const savedCleanPhoto =
    window.parent.localStorage.getItem(
      'usvisa_clean_photo'
    );

  const savedProtectedPreview =
    window.parent.localStorage.getItem(
      'usvisa_protected_preview'
    );

  console.log('RESTORE PHOTO DEBUG', {
    hasCleanPhoto: !!savedCleanPhoto,
    hasProtectedPreview: !!savedProtectedPreview,
    cleanPhotoStart: savedCleanPhoto
      ? savedCleanPhoto.slice(0, 30)
      : null,
    protectedPreviewStart: savedProtectedPreview
      ? savedProtectedPreview.slice(0, 30)
      : null
  });

  if (!savedProtectedPreview) {
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

    console.log(
      'PREVIEW RESTORED SUCCESSFULLY'
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
  console.trace('RESET_FOR_NEW_UPLOAD_CALLED');

professionalPreviewLocked = false;
autoDetectLocked = false;

  uploadedImg = null;
  bgRemovedImg = null;
  resultUrl = null;
  faceTiltAngle = 0;
  autoDetectLocked = false;
  guideMode = 'auto';

  setDetectButtonState('auto');

  setCreateEnabled(false);
  setDownloadEnabled(false);
  resetValidationUI();
  createBtn.textContent = 'Create Photo';
  downloadBtn.style.display = 'none';
  updateBasicPackageButton();
  canvas.style.display = 'none';
  if (resultPanel) resultPanel.style.display = 'none';
  if (uploadTips) uploadTips.style.display = 'block';
  crownLine.style.display = 'none';
  chinLine.style.display = 'none';
  previewImg.style.display = 'none';
  previewImg.src = '';
  placeholder.style.display = 'flex';
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

    createBtn.disabled = false;
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

    createBtn.disabled = false;
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



function validateDetectedPhoto(lm, iw, ih) {
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className = 'validation-card';
  }

  if (checkFace) checkFace.textContent = '🟢 Face detected';

  const eyeResult = detectEyes(lm);

  const leftEyeRatio = eyeResult.leftEyeRatio;
  const rightEyeRatio = eyeResult.rightEyeRatio;
  const eyesClosed = eyeResult.eyesClosed;

  if (checkEyes) {
    checkEyes.textContent = eyesClosed ? '🔴 Eyes may be closed' : '🟢 Eyes open';
  }

  if (eyesClosed) {
    showValidationError(
      '❌ Eyes may be closed.<br>Please upload another photo with both eyes open.'
    );
    return false;
  }

  const mouthResult = detectMouth(lm);

const mouthRatio = mouthResult.mouthRatio;
const mouthOpenDetected = mouthResult.mouthOpened;

  if (checkMouth) {
    checkMouth.textContent = mouthOpenDetected ? '🔴 Mouth should be closed' : '🟢 Mouth closed';
  }

  if (mouthOpenDetected) {
    showValidationError(
      '❌ Mouth should be closed.<br>Please upload a photo with a neutral expression.'
    );
    return false;
  }

  if (checkGlasses) {
    checkGlasses.textContent = '🟢 No glasses detected';
  }

  const headMetrics = getHeadMetrics(lm, iw, ih);

const foreheadY = headMetrics.foreheadY;
const chinY = headMetrics.chinY;
const faceHeight = headMetrics.faceHeight;
const eyebrowTopY = Math.min(
  lm[70].y * ih,
  lm[300].y * ih,
  lm[105].y * ih,
  lm[334].y * ih
);

const chinToEyebrow = chinY - eyebrowTopY;

const estimatedCrownY = Math.max(
  0,
  eyebrowTopY - chinToEyebrow * 0.42
);
const crownToChinRatio = headMetrics.crownToChinRatio;
const bottomSpaceRatio = headMetrics.bottomSpaceRatio;
const headHeightPx = Math.max(1, chinY - estimatedCrownY);
const lowerBodyRoomRatio = (ih - chinY) / headHeightPx;

const shoulderRoomRatio = bottomSpaceRatio;
const headTooLargeForSource = crownToChinRatio > 0.52;
const upperBodyTooClose = lowerBodyRoomRatio < 1.15;
const shouldersLikelyCropped = shoulderRoomRatio < 0.30;

console.log({
  crownToChinRatio,
  lowerBodyRoomRatio,
  shoulderRoomRatio,
  headTooLargeForSource,
  upperBodyTooClose,
  shouldersLikelyCropped
});


const upperBodyHardFail =
  headTooLargeForSource ||
  shouldersLikelyCropped ||
  (upperBodyTooClose && shoulderRoomRatio < 0.38);
  
const upperBodyWarning =
  !upperBodyHardFail && (
    lowerBodyRoomRatio < 1.45 ||
    bottomSpaceRatio < 0.40 ||
    crownToChinRatio > 0.46
  );

const upperBodyTooTight = upperBodyHardFail;

  const faceDirection = detectFaceDirection(lm);

const yawRatio = faceDirection.yawRatio;
const noseOffsetRatio = faceDirection.noseOffsetRatio;
const faceNotStraight = faceDirection.faceNotStraight;
const sideFace = yawRatio < 0.72;

const foreheadToTopRatio = estimatedCrownY / ih;

const eyebrowToCrownRatio = Math.abs(eyebrowTopY - estimatedCrownY) / Math.max(1, faceHeight);
const foreheadHiddenByObject = eyebrowToCrownRatio < 0.22;

const capBrimLikely =
  Math.abs(lm[10].y - lm[151].y) < 0.018 ||
  Math.abs(lm[9].y - lm[10].y) < 0.018;

const hatLikelyDetected =
  capBrimLikely &&
  foreheadToTopRatio < 0.08 &&
  crownToChinRatio > 0.32;



  const faceLeftX = lm[234].x;
const faceRightX = lm[454].x;
const faceCenterX = (faceLeftX + faceRightX) / 2;
const faceWidthRatio = Math.abs(faceRightX - faceLeftX);

const faceCenteredOk =
  faceCenterX > 0.38 &&
  faceCenterX < 0.62;

const faceWidthOk =
  faceWidthRatio < 0.48;
 const headSizeOk = crownToChinRatio <= 0.68;
const bottomSpaceOk = bottomSpaceRatio >= 0.10;

let validationScore = 100;

if (!headSizeOk) validationScore -= 10;
if (!faceCenteredOk) validationScore -= 15;
if (!faceWidthOk) validationScore -= 12;
if (!bottomSpaceOk) validationScore -= 8;
if (upperBodyTooTight) validationScore -= 8;
if (sideFace) validationScore -= 25;
if (faceNotStraight) validationScore -= 25;
if (hatLikelyDetected) validationScore -= 40;

validationScore = Math.max(0, Math.min(100, validationScore));

const directionHardFail =
    sideFace && faceNotStraight;

const shoulderLikelyCropped =
  crownToChinRatio > 0.46 &&
  bottomSpaceRatio < 0.34 &&
  validationScore < 90;

const tightIdPhotoCrop =
  (crownToChinRatio > 0.52 && bottomSpaceRatio < 0.24) ||
  (crownToChinRatio > 0.62 && bottomSpaceRatio < 0.32) ||
  crownToChinRatio > 0.70;

const compositionHardFail =
  tightIdPhotoCrop || shoulderLikelyCropped;
  
const alreadyCropped =
  hatLikelyDetected ||
  directionHardFail ||
  compositionHardFail ||
  shouldersLikelyCropped ||
  
console.log("========== PHOTO DEBUG ==========");

console.table({
  validationScore,
  headSizeOk,
  bottomSpaceOk,
  upperBodyTooTight,
  sideFace,
  faceNotStraight,
  hatLikelyDetected,
  alreadyCropped,
  crownToChinRatio,
  bottomSpaceRatio
});

if (checkPosition) {
  checkPosition.textContent = alreadyCropped
    ? '🔴 Head position / hat check failed'
    : '🟢 Head position and hat check passed';
}

 if (alreadyCropped) {
  if (hatLikelyDetected) {
    showValidationError(
      'Hat or head covering detected.<br>Please upload a photo without hats or head coverings.'
    );
    return false;
  }

  if (faceNotStraight || sideFace) {
    showValidationError(
      'Face is not straight.<br>Please look directly at the camera with your head facing forward.'
    );
    return false;
  }

  if (upperBodyTooTight) {
    showValidationError(
      'Photo is too close.<br>Please upload a photo taken from farther away, showing both shoulders and upper body.'
    );
    return false;
  }

  showValidationError(
    'This looks like an already-cropped ID/passport photo.<br>Please upload the original photo taken from farther away, with shoulders visible.'
  );
  return false;
}
 let score = validationScore;

if (window.usvisaPhotoDateWarning) {
  score = Math.min(score, 98);
}

score = Math.max(80, Math.min(100, score));

  window.usvisaLastValidationReport = {
    score: score,
    headSizeText: 'Head size within accepted range',
    centerText: 'Face centered and forward-facing',
    originalText: 'Original photo check passed',
    metrics: {
      crownToChinRatio: crownToChinRatio,
      bottomSpaceRatio: bottomSpaceRatio,
      yawRatio: yawRatio
    }
  };

  return {
    estimatedCrownY: estimatedCrownY,
    detectedChinY: chinY
  };
}
detectBtn.addEventListener('click', async function(e) {
  e.preventDefault();

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

    const lm = detected.multiFaceLandmarks[0];

    const leftEye = lm[33];
    const rightEye = lm[263];
    faceTiltAngle = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x
    );

    detectedLm = lm;

const validation = validateDetectedPhoto(lm, iw, ih);
if (!validation) return;

lockedDetection = {
  landmarks: lm,
  iw: iw,
  ih: ih,
  faceTiltAngle: faceTiltAngle,
  crownY: validation.estimatedCrownY,
  chinY: validation.detectedChinY
};


if (poseRecoverable) {
  window.usvisaRecoverable = true;

  photoValidationPassed = false;
  autoDetectLocked = true;

  showValidationRecoverable(
    'This photo is cropped too tightly for Basic Photo creation.<br><br>' +
    'Professional Retouch can extend the clothing and shoulder area automatically.'
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
    professionalRetouchBtn.disabled = false;
    updateProfessionalPackageButton();
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

photoValidationPassed = true;  
setDetectButtonState('success');
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

  enhanceCanvas(ctx, TARGET, TARGET);
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
function createProfessionalAlignedPhoto(sourceImg) {
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

// 기존 함수가 바로 이어짐
function createProfessionalAlignedPhoto(sourceImg) {
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

  const crownY = lockedDetection.crownY;
  const chinY = lockedDetection.chinY;

  if (
    !Number.isFinite(crownY) ||
    !Number.isFinite(chinY) ||
    chinY <= crownY
  ) {
    throw new Error(
      'Invalid professional alignment geometry.'
    );
  }

  const currentHeadPx =
    Math.max(1, chinY - crownY);

  const scale =
    (TARGET_HEAD_PX * 0.9) /
    currentHeadPx;

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

  const maxCorrectionPx = 18;

  const correctionX =
    Math.max(
      -maxCorrectionPx,
      Math.min(
        maxCorrectionPx,
        (sourceCenterX -
          detectedFaceCenterX) *
          scale
      )
    );

  professionalCtx.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );

  professionalCtx.clearRect(
    0,
    0,
    TARGET,
    TARGET
  );

  professionalCtx.fillStyle =
    '#ffffff';

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

  professionalCtx.scale(
    scale,
    scale
  );

  professionalCtx.drawImage(
    sourceImg,
    -detectedFaceCenterX,
    -crownY
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
  const sourceResponse = await fetch(sourceUrl);
  const sourceBlob = await sourceResponse.blob();

  const formData = new FormData();

  formData.append(
    'image',
    new File(
      [sourceBlob],
      'us_visa_photo.jpg',
      {
        type: sourceBlob.type || 'image/jpeg'
      }
    )
  );

  formData.append(
    'format',
    'international'
  );

  const response = await fetch(
    '/api/final-photo',
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      'International photo generation failed.'
    );
  }

  const internationalBlob =
    await response.blob();

  return await new Promise(
    function (resolve, reject) {
      const reader =
        new FileReader();

      reader.onload =
        function () {
          resolve(reader.result);
        };

      reader.onerror =
        function () {
          reject(
            new Error(
              'International photo could not be stored.'
            )
          );
        };

      reader.readAsDataURL(
        internationalBlob
      );
    }
  );
}


createBtn.addEventListener('click', async function(e) {
  e.preventDefault();

  const photoState = getPhotoState();

if (
  photoState.fingerprint === currentPhotoFingerprint &&
  photoState.created === true
) {
  restorePreviouslyCreatedPhoto();
  return;
}

  if (!uploadedImg || !uploadedFile) {
    statusEl.textContent = 'Please upload a photo first.';
    return;
  }

  if (!photoValidationPassed || !lockedDetection) {
    statusEl.textContent = 'Please click Auto Detect before creating your photo.';
    setCreateEnabled(false);
    return;
  }

  try {
    setCreateEnabled(false);
    createBtn.textContent = 'Creating...';
statusEl.textContent = 'Creating your photo...';

window.parent.localStorage.removeItem("usvisa_pending_professional_photo");

if (retouchImage) {
  retouchImage.removeAttribute('src');
}

if (retouchPreview) {
  retouchPreview.style.display = 'none';
}

if (professionalRetouchBtn) {
  professionalRetouchBtn.disabled = false;
  updateProfessionalPackageButton();
}
if (!bgRemovedImg) {
      bgRemovedImg = await removeBackgroundWithPhotoRoom();
    }

    const rawCleanUrl = drawFinalPhoto(bgRemovedImg);
const cleanUrl = await createFinalJpegWithSharp(rawCleanUrl);
    resultUrl = cleanUrl;
    savePhotoState({
  fingerprint: currentPhotoFingerprint,
  created: true
});
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
  professionalRetouchBtn.disabled = false;
  updateProfessionalPackageButton();
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

  window.parent.localStorage.setItem(
    'usvisa_pending_international_photo',
    internationalPhoto
  );
} catch (error) {
  console.error(
    'INTERNATIONAL PHOTO GENERATION ERROR:',
    error
  );

  window.parent.localStorage.removeItem(
    'usvisa_pending_international_photo'
  );
}

    window.parent.localStorage.setItem('usvisa_clean_photo', cleanUrl);
    window.parent.localStorage.setItem('usvisa_download_count', '0');

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
    

    window.parent.localStorage.setItem(
      'usvisa_protected_preview',
     protectedCanvas.toDataURL('image/png')
    );

    ctx.clearRect(0, 0, TARGET, TARGET);
    ctx.drawImage(protectedCanvas, 0, 0);
    

    if (tempDownloadBtn) {
  tempDownloadBtn.addEventListener('click', function () {
    const password = window.prompt('Temporary access password');

    if (password !== '7022') {
      alert('Wrong password');
      return;
    }

    const clean = window.parent.localStorage.getItem('usvisa_clean_photo');
    const professional = window.parent.localStorage.getItem('usvisa_pending_professional_photo');

    if (clean) {
      const a = document.createElement('a');
      a.href = clean;
      a.download = 'us_visa_photo_test.jpg';
      a.click();
    }

    if (professional) {
      const a = document.createElement('a');
      a.href = professional;
     a.download = 'professional_retouch_test.jpg';
      a.click();
    }
  });
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

downloadBtn.style.display = 'inline-flex';
    if (uploadTips) uploadTips.style.display = 'none';

    downloadBtn.style.display = 'inline-flex';
   updateBasicPackageButton();

    setDownloadEnabled(true);
    statusEl.textContent = 'Preview created. Unlock download to receive the clean photo.';

  } catch (err) {
    console.error('CREATE PHOTO ERROR:', err);
    statusEl.textContent =
  "Photo processing is temporarily unavailable. Please try again shortly.";
    setCreateEnabled(true);
  } finally {
    createBtn.textContent = 'Create Photo';
  }
});

function getProfessionalPreviewDailyKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return 'usvisa_professional_preview_used_' +
    year + '-' + month + '-' + day;
}

function hasUsedProfessionalPreviewToday() {
  const key = getProfessionalPreviewDailyKey();

  return window.parent.localStorage.getItem(key) === '1';
}

function markProfessionalPreviewUsedToday() {
  const key = getProfessionalPreviewDailyKey();

  window.parent.localStorage.setItem(key, '1');
}

function applyProfessionalPreviewDailyState() {
  if (!professionalRetouchBtn) return;

  const savedProfessionalPhoto =
    window.parent.localStorage.getItem(
      'usvisa_pending_professional_photo'
    );

  if (hasUsedProfessionalPreviewToday()) {
    if (savedProfessionalPhoto) {
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
        'Daily Preview Already Used' +
        '</span>' +
        '<span class="professional-preview-button-note">' +
        'Available again tomorrow' +
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
  e.preventDefault();
  e.stopPropagation();
   const savedProfessionalPhoto =
    window.parent.localStorage.getItem(
      'usvisa_pending_professional_photo'
    );

  if (
    hasUsedProfessionalPreviewToday() &&
    savedProfessionalPhoto
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
      retouchPreview.style.display = 'block';
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

try {
 if (!uploadedFile || !uploadedImg) {
  throw new Error('Please upload a photo first.');
}

if (!lockedDetection) {
  throw new Error(
    'Face measurements are not available. Please run Auto Detect again.'
  );
}

if (!bgRemovedImg) {
  statusEl.textContent =
    'Preparing your photo for Professional Retouch...';

  bgRemovedImg =
    await removeBackgroundWithPhotoRoom();
}

const recoverable =
  window.usvisaRecoverable === true;

if (recoverable) {
  statusEl.textContent =
    'Professional Retouch will reconstruct the missing shoulder area.';
}

const sourceImage =
  recoverable
    ? uploadedImg
    : (bgRemovedImg || uploadedImg);

const professionalAlignedUrl =
  createProfessionalAlignedPhoto(sourceImage);

const professionalBlob =
  await fetch(professionalAlignedUrl).then((res) =>
    res.blob()
  );

const formData = new FormData();

formData.append(
  'image',
  professionalBlob,
  'professional-aligned-photo.jpg'
);
const res = await fetch('/api/professional-retouch', {
  method: 'POST',
  body: formData,
});

      const data = await res.json();
      console.log('Professional Retouch API:', data);
  console.log(
  'Professional Preview Length:',
  data.professionalPreview ? data.professionalPreview.length : 0
);
   
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

window.parent.localStorage.setItem(
  'usvisa_pending_professional_photo',
  finalProfessionalJpg
);

if (retouchImage) {
  retouchImage.src = protectedProfessionalPreview;
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

}

if (retouchPreview) {
  retouchPreview.style.display = 'block';
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
      professionalRetouchBtn.style.display = 'none';
   } finally {
  if (professionalRetouchBtn.textContent !== 'Preview Ready') {
    professionalRetouchBtn.disabled = false;
  }
}
  });
}

premiumCreateBtn?.addEventListener('click', async function () {
  premiumCreateBtn.disabled = true;
  premiumCreateBtn.textContent = 'Opening checkout...';

  try {
    const withInternational =
      professionalInternationalCheckbox &&
      professionalInternationalCheckbox.checked;

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
  if (!resultUrl) {
    statusEl.textContent = 'Please create your photo first.';
    return;
  }

  const searchParams = new URLSearchParams(
  window.parent.location.search
);

const isPaid = searchParams.get('paid') === '1';
const paidProduct = searchParams.get('product') || 'basic';

if (isPaid) {
  const count = Number(
    window.parent.localStorage.getItem('usvisa_download_count') ||
    downloadBtn.dataset.downloadCount ||
    '0'
  );

  if (count >= 5) {
    statusEl.textContent =
      'Download limit reached. Please start a new order if needed.';

    setDownloadEnabled(false);
    downloadBtn.textContent = 'Download limit reached';
    return;
  }

  if (paidProduct === 'professional') {
    const professionalPhoto =
      window.parent.localStorage.getItem(
        'usvisa_pending_professional_photo'
      );

    if (!professionalPhoto) {
      statusEl.textContent =
        'Professional photo could not be found. Please create the preview again.';
      return;
    }

    const professionalLink = document.createElement('a');
    professionalLink.href = professionalPhoto;
    professionalLink.download = 'professional_us_visa_photo.jpg';
    professionalLink.click();
  } else if (paidProduct === 'basic') {
    const basicLink = document.createElement('a');
    basicLink.href = resultUrl;
    basicLink.download = 'us_visa_photo.jpg';
    basicLink.click();
} else if (paidProduct === 'basic-international') {
  const internationalPhoto =
    window.parent.localStorage.getItem(
      'usvisa_pending_international_photo'
    );

  if (!resultUrl || !internationalPhoto) {
    statusEl.textContent =
      'One or more photo files could not be found. Please create the photo again.';
    return;
  }

  const basicLink = document.createElement('a');
  basicLink.href = resultUrl;
  basicLink.download = 'us_visa_photo.jpg';
  document.body.appendChild(basicLink);
  basicLink.click();
  basicLink.remove();

  setTimeout(function () {
    const intlLink = document.createElement('a');
    intlLink.href = internationalPhoto;
    intlLink.download = 'international_35x45_photo.jpg';
    document.body.appendChild(intlLink);
    intlLink.click();
    intlLink.remove();
  }, 500);

} else if (paidProduct === 'professional-international') {
  statusEl.textContent =
    'Professional international photo is still being prepared.';
  return;

  } else {
    statusEl.textContent =
      'The purchased photo package could not be identified.';
    return;
  }

  const nextCount = count + 1;

  downloadBtn.dataset.downloadCount = String(nextCount);

  window.parent.localStorage.setItem(
    'usvisa_download_count',
    String(nextCount)
  );

  statusEl.textContent =
    'Download complete. Remaining downloads: ' +
    (5 - nextCount);

  downloadBtn.textContent = 'Download HD Again';
  return;
}

  setDownloadEnabled(false);
  downloadBtn.textContent = 'Opening checkout...';

  try {
    const selectedPackage = getSelectedBasicPackage();

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
    window.parent.location.href = data.url;
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Payment page failed to open. Please try again.';
    updateBasicPackageButton();
    setDownloadEnabled(true);
  }
});
function restoreProfessionalPreviewIfAvailable() {
  const savedProfessionalPreview =
window.parent.localStorage.getItem(
"usvisa_pending_professional_photo"
);

  if (!savedProfessionalPreview || !retouchImage || !retouchPreview) return;

  retouchImage.src = savedProfessionalPreview;
  retouchPreview.style.display = "block";

  if (professionalCard) {
    professionalCard.style.display = "block";
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.textContent = "Preview Ready";
    professionalRetouchBtn.disabled = true;
  }
}
function restorePaidDownloadIfAvailable() {
  const clean = window.parent.localStorage.getItem('usvisa_clean_photo');
  const protectedPreview = window.parent.localStorage.getItem('usvisa_protected_preview');
  if (!clean && !protectedPreview) return;

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
  window.parent.localStorage.getItem("usvisa_pending_professional_photo");

if (
  savedProfessionalPreview &&
  retouchImage &&
  retouchPreview
) {
  retouchImage.src = savedProfessionalPreview;
  retouchPreview.style.display = "block";

  if (professionalCard) {
    professionalCard.style.display = "block";
  }

  if (professionalRetouchBtn) {
    professionalRetouchBtn.textContent = "Preview Ready";
  }
}

    resultUrl = clean || protectedPreview;
    if (window.parent.location.search.includes('paid=1')) {
    downloadBtn.textContent = '⬇ Download Photos Again';
statusEl.innerHTML =
  '<div style="line-height:1.7">' +
  '<b>✅ Payment Successful!</b><br><br>' +
  '✓ HD U.S. Visa Photo Ready<br>' +
  '✓ Professional Retouch Ready<br><br>' +
  'You can download your files up to <b>5 times</b>.' +
  '</div>';
} else {
   updateBasicPackageButton();
    statusEl.textContent =
        'Preview restored. Unlock download to receive the clean photo.';
}
    setDownloadEnabled(true);
  };
  img.src = window.parent.location.search.includes('paid=1') && clean ? clean : protectedPreview;
}

setCreateEnabled(false);
setDownloadEnabled(false);

if (window.parent.location.search.includes('paid=1')) {
  restorePaidDownloadIfAvailable();
}
  if (window.parent.location.search.includes('paid=1')) {
    setTimeout(() => {
        downloadBtn.click();
    }, 500);
}
`;
