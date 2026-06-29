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
