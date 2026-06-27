"use client";
import HomeTrustSections from "@/components/HomeTrustSections";
const uploadBoxHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;background:#f8fafc;font-family:system-ui}
.wrap{width:100%;height:100%;padding:0}
.upload-zone{
  position:relative;width:100%;height:320px;border:2px dashed #bfdbfe;border-radius:16px;
  background:#f8fafc;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.upload-zone input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:5}
.upload-zone input.disabled-upload{
  pointer-events:none;
  z-index:0;
}
.upload-zone input.disabled-upload{pointer-events:none}
.placeholder{text-align:center;color:#475569;pointer-events:none}
.icon{width:80px;height:80px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px}
.placeholder p{font-size:14px;font-weight:700}
.placeholder small{display:block;margin-top:4px;font-size:12px;color:#94a3b8}
#preview-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none;background:#f8fafc;z-index:2}

.guide-line{
  position:absolute;
  left:0;
  right:0;

  height:2px;

  display:none;
  z-index:50;

  cursor:ns-resize;
  touch-action:none;
}
.guide-line::before{
  content:'';
  position:absolute;
  left:0;
  right:0;
  top:-12px;
  bottom:-12px;
}

.guide-line span{position:absolute;left:8px;top:-18px;font-size:11px;font-weight:800;padding:2px 7px;border-radius:999px;color:white; pointer-events:none;}
#crown-line{top:80px;background:#ef4444}
#crown-line span{background:#ef4444}
#chin-line{top:210px;background:#2563eb}
#chin-line span{background:#2563eb}
.actions{display:flex;gap:8px;margin-top:12px}
button{flex:1;border:0;border-radius:14px;padding:13px 10px;font-size:14px;font-weight:800;cursor:pointer}
#detect-btn{background:#0f766e;color:white}
#create-btn{background:#1e3a8a;color:white}
#download-btn{width:100%;margin-top:8px;background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;display:none}
#result-canvas{display:none;width:100%;margin-top:12px;border-radius:16px;background:white;border:1px solid #dbeafe}
.new-photo-btn{
  width:100%;
  margin-top:8px;
  background:#f8fafc;
  color:#1e3a8a;
  border:1px solid #bfdbfe;
}
.status{font-size:12px;color:#64748b;text-align:center;margin-top:8px;min-height:18px;line-height:1.5}
.notice{
  margin-top:10px;
  padding:10px;
  border-radius:12px;
  background:#eff6ff;
  color:#1e3a8a;
  font-size:11px;
  line-height:1.5;
  text-align:left;
}
.notice a{
  color:#1d4ed8;
  font-weight:800;
  text-decoration:underline;
}
</style>
</head>
<body>
<div class="wrap">
  <div class="upload-zone" id="upload-zone">
    <input type="file" id="file-input" accept="image/*" />
    <div class="placeholder" id="placeholder">
      <div class="icon">📷</div>
      <p>Upload your photo</p>
      <small>Selected photo appears here</small>
    </div>
    <img id="preview-img" alt="preview" />
    <div class="guide-line" id="crown-line"><span>Crown</span></div>
    <div class="guide-line" id="chin-line"><span>Chin</span></div>
  </div>

  <div class="actions">
    <button id="detect-btn" type="button">Auto Detect</button>
<button id="create-btn" type="button">Create Photo</button>
  </div>
  <button id="new-photo-btn" type="button" class="new-photo-btn">
  Choose Another Photo
</button>

  <div class="guide-note">
  Auto detection is applied automatically.<br>
  If the crown or chin line looks inaccurate,
  drag the guide lines before creating your photo.
</div>

 <button id="download-btn">
  Unlock Download - $4.99
</button>
  <canvas id="result-canvas" width="600" height="600"></canvas>
  <div class="status" id="status">Upload a photo first</div>
</div>
<div class="notice">
  <strong>Before uploading:</strong><br>
  Look directly at the camera · Keep both eyes open · Keep your mouth closed · Do not wear hats or sunglasses.
  <br><br>
  For special cases or manual review, contact:
  <a href="mailto:usvisaphoto1@gmail.com">usvisaphoto1@gmail.com</a>
</div>

<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>

<script>
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
const canvas = document.getElementById('result-canvas');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

let uploadedFile = null;
let uploadedImg = null;
let bgRemovedImg = null;
let resultUrl = null;
let faceTiltAngle = 0;
let photoValidationPassed = false;
let draggingLine = null;
function showRequirementAlert() {
  const message = [
    "U.S. Visa Photo Check",
    "",
    "✓ Eyes open",
    "✓ Mouth closed",
    "✓ No visible teeth",
    "✓ No hats or sunglasses",
    "✓ Verify Crown & Chin lines",
    "",
    "Incorrect photos may be rejected."
  ].join("\\n");

  window.alert(message);
}let faceMesh = null;

const TARGET = 600;
const PHOTO_CM = 5.08;
const HEAD_CM = 2.8;
const TARGET_HEAD_PX = TARGET * (HEAD_CM / PHOTO_CM);
const TOP_MARGIN_CM = 0.55;
const TOP_MARGIN_PX = TARGET * (TOP_MARGIN_CM / PHOTO_CM);

function getCurrentImage() {
  return bgRemovedImg || uploadedImg;
}

function getContainRect() {
  const img = getCurrentImage();
  const zw = zone.clientWidth;
  const zh = zone.clientHeight;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(zw / iw, zh / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const left = (zw - dw) / 2;
  const top = (zh - dh) / 2;
  return { left, top, dw, dh, scale, iw, ih };
}

function lineTopPx(line) {
  return parseFloat(line.style.top || line.offsetTop || 0);
}

function setLineTop(line, y) {
  const rect = getContainRect();
  const minY = rect.top;
  const maxY = rect.top + rect.dh;
  const clamped = Math.max(minY, Math.min(maxY, y));
  line.style.top = clamped + 'px';
}

function imageYFromLine(line) {
  const rect = getContainRect();
  const y = lineTopPx(line);
  return (y - rect.top) / rect.scale;
}

function imageYToScreen(y) {
  const rect = getContainRect();
  return rect.top + y * rect.scale;
}

function initGuideLines() {
  if (!getCurrentImage()) return;
  const rect = getContainRect();
  crownLine.style.display = 'block';
  chinLine.style.display = 'block';
  crownLine.style.top = (rect.top + rect.dh * 0.18) + 'px';
  chinLine.style.top = (rect.top + rect.dh * 0.68) + 'px';
  statusEl.textContent = 'Click Auto Detect. You can drag lines if needed.';
}

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  // 새 사진 업로드 시 이전 결제 상태 초기화
window.parent.localStorage.removeItem('usvisa_clean_photo');
window.parent.localStorage.removeItem('usvisa_download_count');
window.parent.localStorage.removeItem('usvisa_pending_clean_photo');
window.parent.localStorage.removeItem('usvisa_protected_preview');

if (window.parent.location.search.includes('paid=1')) {
  window.parent.history.replaceState({}, '', window.parent.location.pathname);
}


  uploadedFile = file;
  bgRemovedImg = null;
  resultUrl = null;
  photoValidationPassed = false;
  

  createBtn.disabled = false;
  createBtn.style.opacity = "1";
  createBtn.textContent = 'Create Photo';

  canvas.style.display = 'none';
  downloadBtn.style.display = 'none';

  statusEl.innerHTML = "Photo uploaded. Click Auto Detect.";

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = function() {
    uploadedImg = img;
  
    fileInput.classList.add('disabled-upload');
    
    
    previewImg.src = url;
    previewImg.style.display = 'block';
   
    

    placeholder.style.display = 'none';

    setTimeout(initGuideLines, 50);
  };

  img.onerror = function() {
    statusEl.innerHTML = "Image preview failed. Please try another photo.";
  };

  img.src = url;
});
newPhotoBtn.addEventListener('click', function() {
  fileInput.classList.remove('disabled-upload');
  fileInput.value = '';
  fileInput.click();
});

[crownLine, chinLine].forEach(line => {
  line.addEventListener('mousedown', function(e) {
    e.preventDefault();
    draggingLine = line;
  });
  line.addEventListener('touchstart', function(e) {
    e.preventDefault();
    draggingLine = line;
  }, { passive:false });
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
}, { passive:false });

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

detectBtn.addEventListener('click', async function(e) {
  e.preventDefault();

  const img = getCurrentImage();

  if (!img) {
    statusEl.textContent = 'Please upload a photo first.';
    return;
  }

  statusEl.textContent = 'Detecting face...';

  try {
    const fm = await initFaceMesh();
    let detected = null;

    fm.onResults(function(results) {
      detected = results;
    });

    const tempCanvas = document.createElement('canvas');
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    tempCanvas.width = iw;
    tempCanvas.height = ih;

    const tctx = tempCanvas.getContext('2d');
    tctx.drawImage(img, 0, 0);

    await fm.send({ image: tempCanvas });

    let wait = 0;
    while (!detected && wait < 3000) {
      await new Promise(r => setTimeout(r, 100));
      wait += 100;
    }

    if (!detected || !detected.multiFaceLandmarks || !detected.multiFaceLandmarks.length) {
      
      return;
    }

    const lm = detected.multiFaceLandmarks[0];
    
    const leftEye = lm[33];
const rightEye = lm[263];

faceTiltAngle = Math.atan2(
  rightEye.y - leftEye.y,
  rightEye.x - leftEye.x
);
    if (detected.multiFaceLandmarks.length > 1) {
  
  return;
}

// 눈 감음 검사
function eyeOpenRatio(leftTop, leftBottom, leftOuter, leftInner) {
  const vertical = Math.abs(lm[leftTop].y - lm[leftBottom].y);
  const horizontal = Math.abs(lm[leftOuter].x - lm[leftInner].x);
  return vertical / horizontal;
}

const leftEyeRatio = eyeOpenRatio(159, 145, 33, 133);
const rightEyeRatio = eyeOpenRatio(386, 374, 362, 263);

if (leftEyeRatio < 0.16 || rightEyeRatio < 0.16) {
  
  return;
}

// 입 벌림 / 치아 노출 가능성 검사
const mouthOpen = Math.abs(lm[13].y - lm[14].y);
const faceHeightCheck = Math.abs(lm[152].y - lm[10].y);
const mouthRatio = mouthOpen / faceHeightCheck;

if (mouthRatio > 0.055) {
  
  return;
}

    const forehead = lm[10];
    const chin = lm[152];

    const foreheadY = forehead.y * ih;
    const chinY = chin.y * ih;
    const faceHeight = chinY - foreheadY;

    const estimatedCrownY = Math.max(0, foreheadY - faceHeight * 0.38);
    const detectedChinY = chinY;

    crownLine.style.display = 'block';
    chinLine.style.display = 'block';

    crownLine.style.top = imageYToScreen(estimatedCrownY) + 'px';
    chinLine.style.top = imageYToScreen(detectedChinY) + 'px';
   
    showRequirementAlert();     
    statusEl.innerHTML = 'Auto detection completed.<br><br>Please verify before creating your photo:<br>✓ Eyes are fully open<br>✓ Mouth is closed (no visible teeth)<br>✓ No hat or sunglasses<br>✓ Crown line touches the top of the hair<br>✓ Chin line touches the bottom of the chin<br><br>Drag the guide lines if adjustment is needed.';

  } catch (err) {
    statusEl.textContent = 'Auto detect failed. Please adjust lines manually.';
  }
});
function enhanceCanvas(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const contrast = 1.08;
  const brightness = 4;

  for (let i = 0; i < data.length; i += 4) {
    // 거의 흰 배경은 유지
    if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) continue;

    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
  }

  ctx.putImageData(imageData, 0, 0);

  // 약한 샤픈
  const sharpData = ctx.getImageData(0, 0, width, height);
  const src = new Uint8ClampedArray(sharpData.data);
  const dst = sharpData.data;

  const kernel = [
     0, -0.25,  0,
    -0.25, 2.0, -0.25,
     0, -0.25,  0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // 흰 배경은 샤픈 제외
      if (src[idx] > 245 && src[idx + 1] > 245 && src[idx + 2] > 245) continue;

      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pidx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += src[pidx] * kernel[k];
            k++;
          }
        }

        dst[idx + c] = Math.min(255, Math.max(0, sum));
      }
    }
  }

  ctx.putImageData(sharpData, 0, 0);
}

function applyPreviewProtection(ctx, width, height) {
  // 원본 결과를 임시 저장
  const original = ctx.getImageData(0, 0, width, height);

  // 얼굴 중앙 영역만 블러 처리
  const blurX = width * 0.28;
  const blurY = height * 0.28;
  const blurW = width * 0.44;
  const blurH = height * 0.30;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.putImageData(original, 0, 0);

  ctx.save();
  ctx.filter = 'blur(10px)';
  ctx.drawImage(
    tempCanvas,
    blurX,
    blurY,
    blurW,
    blurH,
    blurX,
    blurY,
    blurW,
    blurH
  );
  ctx.restore();

  // 워터마크 반복
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 22px Arial';
  ctx.rotate(-0.45);

  for (let y = -height; y < height * 2; y += 90) {
    for (let x = -width; x < width * 2; x += 180) {
      ctx.fillText('USVISAPHOTO PREVIEW', x, y);
    }
  }

  ctx.restore();

  // 중앙 안내 바
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(width * 0.12, height * 0.72, width * 0.76, 52);

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Unlock high-quality download after payment', width / 2, height * 0.72 + 33);
  ctx.restore();

  }


async function removeBackgroundWithPhotoRoom() {
  if (!uploadedFile) throw new Error('No uploaded file');

  statusEl.textContent = 'Processing photo...';

  const formData = new FormData();
  formData.append('image', uploadedFile);

  const response = await fetch('/api/remove-background', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Background removal failed');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

createBtn.addEventListener('click', async function(e) {
  e.preventDefault();
  shouldScrollAfterCreate = true;

  if (!uploadedImg || !uploadedFile) {
    statusEl.textContent = 'Please upload a photo first.';
    return;
  }

  createBtn.disabled = true;
  createBtn.textContent = 'Processing...';

  try {
    if (!bgRemovedImg) {
      bgRemovedImg = await removeBackgroundWithPhotoRoom();
    }

    const img = bgRemovedImg;

    
    

    const crownY = imageYFromLine(crownLine);
    const chinY = imageYFromLine(chinLine);
    const headPxOriginal = chinY - crownY;

    if (headPxOriginal <= 10) {
      statusEl.textContent = 'Chin line must be below Crown line.';
      createBtn.disabled = false;
      createBtn.textContent = 'Create Photo';
      return;
    }

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const scale = TARGET_HEAD_PX / headPxOriginal;
    const crownX = iw / 2;
    const centerX = crownX;

    canvas.width = TARGET;
    canvas.height = TARGET;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, TARGET, TARGET);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const drawW = iw * scale;
    const drawH = ih * scale;

    const CENTER_FIX_X = 23; // 오른쪽으로 23px 이동
const dx = TARGET / 2 - centerX * scale + CENTER_FIX_X;
    const dy = TOP_MARGIN_PX - crownY * scale;

    ctx.save();

ctx.translate(TARGET / 2, TARGET / 2);

ctx.rotate(-faceTiltAngle);

ctx.drawImage(
  img,
  dx - TARGET / 2,
  dy - TARGET / 2,
  drawW,
  drawH
);

ctx.restore();

enhanceCanvas(ctx, TARGET, TARGET);

resultUrl = canvas.toDataURL('image/jpeg', 0.97);

// 깨끗한 원본은 결제 전 임시 보관
window.parent.localStorage.setItem('usvisa_pending_clean_photo', resultUrl);

// 결제 전 미리보기 보호 처리
applyPreviewProtection(ctx, TARGET, TARGET);

// 보호된 미리보기 화면도 저장
const protectedPreviewUrl = canvas.toDataURL('image/jpeg', 0.92);
window.parent.localStorage.setItem('usvisa_protected_preview', protectedPreviewUrl);

canvas.style.display = 'block';
downloadBtn.style.display = 'block';
downloadBtn.disabled = false;
downloadBtn.textContent = 'Unlock Download - $4.99';

statusEl.textContent = 'Preview only. Face area is blurred and watermarked until payment.';  } catch (err) {
scrollToResultPreview();

statusEl.textContent = 'Preview only. Face area is blurred and watermarked until payment.';
if (shouldScrollAfterCreate) {
  shouldScrollAfterCreate = false;

  setTimeout(() => {
    const frame = window.frameElement;

    if (frame && window.parent) {
      const frameRect = frame.getBoundingClientRect();
      const targetTop =
        window.parent.scrollY +
        frameRect.top +
        canvas.offsetTop -
        80;

      window.parent.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  }, 500);
}

if (resultUrl && uploadedFile) {
  setTimeout(() => {
    canvas.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 500);
}

console.error(err);
    statusEl.textContent = 'Photo processing failed. Please try again.';
  }

  createBtn.disabled = false;
  createBtn.textContent = 'Create Photo';
});

function restorePaidDownloadIfAvailable() {
  const isPaid = window.parent.location.search.includes('paid=1');
  const savedPhoto = window.parent.localStorage.getItem('usvisa_clean_photo');
  const savedDownloadCount = window.parent.localStorage.getItem('usvisa_download_count') || '0';

  if (!isPaid || !savedPhoto) return;

  resultUrl = savedPhoto;

  const paidImg = new Image();

  paidImg.onload = function() {
    canvas.width = TARGET;
    canvas.height = TARGET;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, TARGET, TARGET);
    
    ctx.drawImage(paidImg, 0, 0, TARGET, TARGET);

    canvas.style.display = 'block';
    downloadBtn.style.display = 'block';
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download Photo';

    downloadBtn.dataset.downloadCount = savedDownloadCount;

    statusEl.textContent = 'Payment complete. Your download is ready.';
  };

  paidImg.src = savedPhoto;
}
function restoreUnpaidPreviewIfAvailable() {
  const isPaid = window.parent.location.search.includes('paid=1');
  if (isPaid) return;

  const savedClean = window.parent.localStorage.getItem('usvisa_pending_clean_photo');
  const savedPreview = window.parent.localStorage.getItem('usvisa_protected_preview');

  if (!savedClean || !savedPreview) return;

  resultUrl = savedClean;

  const preview = new Image();

  preview.onload = function() {
    canvas.width = TARGET;
    canvas.height = TARGET;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, TARGET, TARGET);
    ctx.drawImage(preview, 0, 0, TARGET, TARGET);

    canvas.style.display = 'block';

// 모바일에서 결과 사진 위치로 자동 이동
setTimeout(() => {
  canvas.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}, 300);

downloadBtn.style.display = 'block';
downloadBtn.disabled = false;
downloadBtn.textContent = 'Unlock Download - $4.99';


    statusEl.textContent = 'Preview restored. Unlock download after payment.';
  };

  preview.src = savedPreview;
}

restoreUnpaidPreviewIfAvailable();


restorePaidDownloadIfAvailable();

downloadBtn.addEventListener('click', async function() {
  if (!resultUrl) {
    statusEl.textContent = 'Please create your photo first.';
    return;
  }

  const isPaid = window.parent.location.search.includes('paid=1');

  if (isPaid) {
  const count = Number(downloadBtn.dataset.downloadCount || '0');

  if (count >= 5) {
    statusEl.textContent = 'Download limit reached. Please start a new order if needed.';
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Download limit reached';
    return;
  }

  const a = document.createElement('a');
  a.href = resultUrl;
  a.download = 'USVisaPhoto_Embassy_Ready.jpg';
  a.click();

  const nextCount = count + 1;
  downloadBtn.dataset.downloadCount = String(nextCount);
  window.parent.localStorage.setItem('usvisa_download_count', String(nextCount));

  statusEl.textContent = 'Download complete. Remaining downloads: ' + (5 - nextCount);

  return;
}
  window.parent.localStorage.setItem('usvisa_clean_photo', resultUrl);

  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Opening PayPal...';

  try {
    const response = await fetch('/api/create-paypal-order', {
  method: 'POST',
  });

    const data = await response.json();

    if (data.url) {
      window.parent.location.href = data.url;
    } else {
      throw new Error('No checkout URL');
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Payment page failed to open. Please try again.';
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Unlock Download - $4.99';
  }
});
</script>
</body>
</html>
`;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-blue-900">
            US
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold">USVisaPhoto</div>
            <div className="text-xs text-blue-100 md:hidden">
              Embassy-Ready Photos
            </div>
          </div>
        </a>

        <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-900 shadow-lg">
          Start Photo
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-16 pt-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
            Professional Standards · 25 Years Experience
          </div>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Embassy-Ready U.S. Visa & Passport Photos
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">
            Upload, remove background, auto-size crown-to-chin to 2.8cm, and
            download a 600×600 US visa photo.
          </p>

          <div className="mt-7 rounded-2xl bg-white px-7 py-4 text-center text-base font-extrabold text-blue-950 shadow-xl">
            Upload Your Photo
          </div>

          <div className="mt-8 grid max-w-md grid-cols-4 gap-3">
            {["US", "KR", "JP", "CN", "CA", "IN", "VN", "Other"].map(
              (country) => (
                <button
                  key={country}
                  type="button"
                  className={`rounded-2xl border px-3 py-3 text-sm font-bold ${
                    country === "US"
                      ? "border-white bg-white text-blue-950"
                      : "border-white/25 bg-white/10 text-white"
                  }`}
                >
                  {country}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-blue-950">
                    Embassy-Ready Photo Creator
                  </div>
                  <div className="text-xs text-slate-500">
  Upload · Auto Detect · Create Photo · Download
</div>
                </div>

                <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
                  US 2x2
                </div>
              </div>

              <iframe
                title="Upload Preview"
                srcDoc={uploadBoxHtml}
                className="min-h-[820px] w-full rounded-2xl border-0"
              />
            </div>
          </div>
        </div>
      </section>
   <HomeTrustSections />
    </main>
  );
}