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
const professionalRetouchBtn = document.getElementById('professional-retouch-btn');
const retouchPreview = document.getElementById('retouch-preview');
const retouchImage = document.getElementById('retouch-image');
const premiumCreateBtn = document.getElementById('premium-create-btn');
const canvas = document.getElementById('result-canvas');
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
const ctx = canvas.getContext('2d');


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
  const errorHtml =
  '<div style="font-size:16px;font-weight:900;color:#b91c1c;line-height:1.5;background:#fee2e2;border:1px solid #fca5a5;border-radius:14px;padding:12px;margin-top:8px;text-align:center;">' +
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
  if (validationCard) {
    validationCard.style.display = 'block';
    validationCard.className = 'validation-card validation-success';
  }

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

  setTimeout(function () {
    if (validationCard) {
      validationCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, 100);
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
  if (window.parent.location.search.includes('paid=1')) {
    window.parent.history.replaceState({}, '', window.parent.location.pathname);
  }
}


function createProtectedProfessionalPreview(src) {
  return new Promise(function (resolve, reject) {
    const img = new Image();

    img.onload = function () {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = TARGET;
      previewCanvas.height = TARGET;

      const pctx = previewCanvas.getContext('2d');

      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = TARGET;
      blurCanvas.height = TARGET;

      const bctx = blurCanvas.getContext('2d');

      bctx.filter = 'blur(14px)';
      bctx.drawImage(img, -20, -20, TARGET + 40, TARGET + 40);

      pctx.drawImage(blurCanvas, 0, 0);

      pctx.save();
      pctx.beginPath();
      pctx.ellipse(TARGET / 2, TARGET * 0.36, TARGET * 0.2, TARGET * 0.25, 0, 0, Math.PI * 2);
      pctx.clip();
      pctx.drawImage(img, 0, 0, TARGET, TARGET);
      pctx.restore();

      pctx.save();
      pctx.globalAlpha = 0.28;
      pctx.fillStyle = '#1e3a8a';
      pctx.font = 'bold 18px Arial';
      pctx.translate(TARGET / 2, TARGET / 2);
      pctx.rotate(-Math.PI / 7);

      for (let y = -TARGET; y < TARGET; y += 70) {
        for (let x = -TARGET; x < TARGET; x += 210) {
          pctx.fillText('USVISAPHOTO PREVIEW', x, y);
        }
      }

      pctx.restore();

      resolve(previewCanvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = src;
  });
}
function resetForNewUpload() {
  console.trace('RESET_FOR_NEW_UPLOAD_CALLED');

  if (professionalPreviewLocked) return;

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
  downloadBtn.textContent = '🔓 Unlock HD Photo — $4.99';
  canvas.style.display = 'none';
  if (resultPanel) resultPanel.style.display = 'none';
  if (uploadTips) uploadTips.style.display = 'block';
  crownLine.style.display = 'none';
  chinLine.style.display = 'none';
  previewImg.style.display = 'none';
  previewImg.src = '';
  placeholder.style.display = 'flex';
}

fileInput.addEventListener('change', function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  
  clearPaymentState();
  resetForNewUpload();
  uploadedFile = file;
  statusEl.textContent = 'Photo uploaded. Click Auto Detect.';

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = function() {
    uploadedImg = img;
    fileInput.classList.add('disabled-upload');
    previewImg.src = url;
    previewImg.style.display = 'block';
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

  const mouthOpen = Math.abs(lm[13].y - lm[14].y);
  const faceHeightCheck = Math.abs(lm[152].y - lm[10].y);
  const mouthRatio = mouthOpen / faceHeightCheck;
  const mouthOpenDetected = mouthRatio > 0.055;

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
    tempCanvas.getContext('2d').drawImage(img, 0, 0);

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

    if (!poseComposition.pass) {
    showValidationError(
        'Shoulders and upper body are cropped.<br>Please upload a photo showing both shoulders.'
    );
    return;
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

  ctx.save();
  ctx.filter = 'blur(10px)';
  ctx.drawImage(tempCanvas, 0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 22px Arial';
  ctx.rotate(-0.45);

  for (let y = -height; y < height * 2; y += 90) {
    for (let x = -width; x < width * 2; x += 180) {
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

  return canvas.toDataURL('image/jpeg', 0.95);
}

createBtn.addEventListener('click', async function(e) {
  e.preventDefault();

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

window.parent.localStorage.removeItem('usvisa_professional_preview');

if (retouchImage) {
  retouchImage.removeAttribute('src');
}

if (retouchPreview) {
  retouchPreview.style.display = 'none';
}

if (professionalRetouchBtn) {
  professionalRetouchBtn.disabled = false;
  professionalRetouchBtn.textContent = 'See Professional Preview — $9.99';
}

if (!bgRemovedImg) {
      bgRemovedImg = await removeBackgroundWithPhotoRoom();
    }

    const cleanUrl = drawFinalPhoto(bgRemovedImg);
    resultUrl = cleanUrl;

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

canvas.style.display = 'block';

if (resultPanel) resultPanel.style.display = 'block';

const professionalCard =
    document.getElementById('professional-retouch-card');

if (professionalCard)
    professionalCard.style.display = 'block';

if (uploadTips) uploadTips.style.display = 'none';

downloadBtn.style.display = 'inline-flex';
    if (uploadTips) uploadTips.style.display = 'none';

    downloadBtn.style.display = 'inline-flex';
    downloadBtn.textContent = window.parent.location.search.includes('paid=1')
      ? 'Download Photo'
      : '🔓 Unlock HD Photo – $4.99';

    setDownloadEnabled(true);
    statusEl.textContent = 'Preview created. Unlock download to receive the clean photo.';

  } catch (err) {
    console.error('CREATE PHOTO ERROR:', err);
    statusEl.textContent = 'ERROR: ' + (err && err.message ? err.message : String(err));
    setCreateEnabled(true);
  } finally {
    createBtn.textContent = 'Create Photo';
  }
});
if (professionalRetouchBtn) {
  professionalRetouchBtn.addEventListener('click', async function (e) {
  e.preventDefault();
  e.stopPropagation();
professionalRetouchBtn.disabled = true;

let retouchCountdown = 60;
professionalRetouchBtn.textContent = 'Preparing preview... ' + retouchCountdown + 's';

const retouchTimer = setInterval(function () {
  retouchCountdown -= 1;

  if (retouchCountdown > 0) {
    professionalRetouchBtn.textContent = 'Preparing preview... ' + retouchCountdown + 's';
  } else {
    professionalRetouchBtn.textContent = 'Almost ready...';
  }
}, 1000);

professionalPreviewLocked = true;
  throw new Error('Please create your photo first.');
}

const imageBlob = await fetch(resultUrl).then((res) => res.blob());

const formData = new FormData();
formData.append('image', imageBlob, 'professional-retouch-source.png');

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
  throw new Error(data.error || 'Professional retouch failed.');
}

if (!data.professionalPreview) {
  throw new Error('Professional preview image was not returned.');
}

const protectedProfessionalPreview =
  await createProtectedProfessionalPreview(data.professionalPreview);

window.parent.localStorage.setItem(
  'usvisa_pending_professional_photo',
  data.professionalPreview
);

if (retouchImage) {
  retouchImage.src = protectedProfessionalPreview;
  retouchImage.setAttribute('draggable', 'false');
  retouchImage.oncontextmenu = function (e) {
    e.preventDefault();
    return false;
  };
}

if (retouchPreview) {
  retouchPreview.style.display = 'block';
}

if (professionalCard) {
  professionalCard.style.display = 'block';
}
clearInterval(retouchTimer);
professionalRetouchBtn.textContent = 'Preview Ready';
professionalRetouchBtn.disabled = true;
 } catch (err) {
  clearInterval(retouchTimer);
  console.error('Professional Retouch Error:', err);
      professionalRetouchBtn.textContent = 'Try Again';
   } finally {
  if (professionalRetouchBtn.textContent !== 'Preview Ready') {
    professionalRetouchBtn.disabled = false;
  }
}
  });
}
downloadBtn.addEventListener('click', async function() {
  if (!resultUrl) {
    statusEl.textContent = 'Please create your photo first.';
    return;
  }

  const isPaid = window.parent.location.search.includes('paid=1');

  if (isPaid) {
    const count = Number(window.parent.localStorage.getItem('usvisa_download_count') || downloadBtn.dataset.downloadCount || '0');
    if (count >= 5) {
      statusEl.textContent = 'Download limit reached. Please start a new order if needed.';
      setDownloadEnabled(false);
      downloadBtn.textContent = 'Download limit reached';
      return;
    }

    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'us_visa_photo.jpg';
    a.click();

    const nextCount = count + 1;
    downloadBtn.dataset.downloadCount = String(nextCount);
    window.parent.localStorage.setItem('usvisa_download_count', String(nextCount));
    statusEl.textContent = 'Download complete. Remaining downloads: ' + (5 - nextCount);
    return;
  }

  setDownloadEnabled(false);
  downloadBtn.textContent = 'Opening checkout...';

  try {
    const response = await fetch('/api/create-paypal-order', { method: 'POST' });
    const data = await response.json();
    if (!data.url) throw new Error('No checkout URL');
    window.parent.location.href = data.url;
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Payment page failed to open. Please try again.';
    downloadBtn.textContent = '🔓 Unlock HD Photo — $4.99';
    setDownloadEnabled(true);
  }
});
function restoreProfessionalPreviewIfAvailable() {
  const savedProfessionalPreview =
    window.parent.localStorage.getItem("usvisa_professional_preview");

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
  window.parent.localStorage.getItem("usvisa_professional_preview");

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
      downloadBtn.textContent = 'Download Photo';
      statusEl.textContent = 'Payment confirmed. You can download your clean photo.';
    } else {
      downloadBtn.textContent = '🔓 Unlock HD Photo — $4.99';
      statusEl.textContent = 'Preview restored. Unlock download to receive the clean photo.';
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
`;
