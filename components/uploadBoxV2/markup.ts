export const uploadBoxMarkup = String.raw`
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

  <div class="guide-note" id="guideNote">
    Auto detection is applied automatically.<br>
    If the crown or chin line looks inaccurate,
    drag the guide lines before creating your photo.
  </div>


<div
  id="validation-card"
  style="
    display:none;
    margin-top:16px;
    margin-bottom:16px;
    padding:18px;
    border-radius:16px;
    background:#ecfdf5;
    border:1px solid #86efac;
    color:#065f46;
    box-shadow:0 8px 24px rgba(0,0,0,.08);
    line-height:1.7;
  "
>

<div style="font-size:18px;font-weight:700;margin-bottom:10px;">
✅ Photo Validation Report
</div>

<div>👁 Eyes Open</div>
<div>🙂 Mouth Closed</div>
<div>🦷 No Visible Teeth</div>
<div>🧢 No Hats or Sunglasses</div>
<div>📏 Head Position Detected</div>

<hr style="margin:14px 0;">

<div style="font-size:14px;">
Please verify the Crown and Chin guide lines before creating your photo.
</div>

</div>

<div id="validation-card" class="validation-card" style="display:none;">
  <div class="validation-title">Photo Validation Report</div>

  <div id="check-face" class="validation-row">Checking face...</div>
  <div id="check-eyes" class="validation-row">Checking eyes...</div>
  <div id="check-mouth" class="validation-row">Checking mouth...</div>
  <div id="check-glasses" class="validation-row">Checking glasses...</div>
  <div id="check-position" class="validation-row">Checking head position...</div>

  <div id="validation-final" class="validation-final"></div>
</div>

  <div class="status" id="status">Upload a photo first</div>

  <div class="notice" id="uploadTips">
    <strong>Before uploading:</strong><br>
    Look directly at the camera · Keep both eyes open · Keep your mouth closed · Do not wear hats or sunglasses.
    <br><br>
    For special cases or manual review, contact:
    <a href="mailto:usvisaphoto1@gmail.com">usvisaphoto1@gmail.com</a>
  </div>

  <div id="resultPanel" class="result-panel">
    <div class="result-title">Preview Result</div>
    <div class="result-subtitle">
      Face area is blurred and watermarked until payment.
    </div>

    <div class="result-canvas-wrap">
      <canvas id="result-canvas" width="600" height="600"></canvas>
    </div>

    <button id="download-btn" type="button">
      Unlock Download - $4.99
    </button>

    <div class="result-help">
      Need help? Contact
      <a href="mailto:usvisaphoto1@gmail.com">usvisaphoto1@gmail.com</a>
    </div>
  </div>
</div>
`;
