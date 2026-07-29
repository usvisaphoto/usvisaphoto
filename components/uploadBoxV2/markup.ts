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
   Your photo has been automatically checked and is ready to create.
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

 <div id="expert-edit-card" class="expert-manual-card">

  <div class="expert-service-badge">
    PREMIUM MANUAL SERVICE
  </div>

  <div class="expert-title">
    ⭐ 3. Expert Manual Editing
  </div>

  <div class="expert-subtitle">
    Recommended when Auto Detect cannot approve your photo
    or when you need to use your original photo without retaking it.
  </div>

  <div class="expert-highlight">
    Every photo is personally reviewed, retouched, and checked
    by an experienced photo specialist.
  </div>

  <div class="expert-features">
    <div>✓ Manual review by a photo specialist</div>
    <div>✓ U.S. embassy compliance assessment</div>
    <div>✓ Natural professional retouch</div>
    <div>✓ Hair and clothing refinement</div>
    <div>✓ Priority Email or WhatsApp delivery</div>
    <div>✓ Delivered within 24 hours</div>
  </div>

  <button id="expert-edit-btn" type="button">
    <span class="expert-button-title">
      🔓 Start Manual Editing
    </span>

    <span class="expert-button-price">
      $19.99
    </span>
  </button>

</div>
<div id="resultPanel" class="result-panel">
  <div class="result-title">1. Basic Photo</div>
    <div class="result-subtitle">
  Your photo has passed validation. Choose your preferred photo package below.
</div>

    <div class="result-canvas-wrap">

    <div class="result-badge">
        <div class="badge-title">
            🇺🇸 Embassy-Ready
        </div>

        <div class="badge-subtitle">
            2×2 inch · 300 DPI
        </div>
    </div>

    <canvas id="result-canvas" width="600" height="600">
     </canvas>

<canvas
  id="overlay-canvas"
  width="600"
  height="600">
</canvas>

</div>
<div id="photo-type-card" class="photo-type-card">

<div class="photo-options">

  <label class="photo-option">
    <input
      type="radio"
      name="photoType"
      value="visa-only"
      checked>

    <span class="photo-option-content">
      <strong>U.S. Visa Photo Only</strong>
      <small>2 × 2 inch</small>
    </span>
  </label>

  <label class="photo-option">
    <input
      type="radio"
      name="photoType"
      value="visa-plus-international">

    <span class="photo-option-content">
      <strong>U.S. Visa + International Visa Photo</strong>
      <small>2 × 2 inch + 3.5 × 4.5 cm</small>
    </span>
  </label>

</div>

<div id="basic-package-note" class="basic-package-note">
  <strong>Need both photo sizes?</strong><br>
  Select the second option before checkout.

  <small>
    Incorrect package selections are non-refundable.
  </small>
</div>

<div
  id="international-package-info"
  class="international-package-info">

  <strong>Includes both photo sizes · $7.99 total</strong>

  <span>
    ✓ 3.5 × 4.5 cm version uses the standard 3.2 cm face height.
  </span>
</div>

<div
  id="international-photo-warning"
  class="international-photo-warning">

  <strong>⚠ International Photo Notice</strong>

  <span>
    Some countries may reject visa photos when the eyebrows,
    ears, or facial outline are obscured by hair.
    For best results, use a photo with these features clearly visible.
  </span>
</div>

</div>
    <button id="download-btn" type="button">
      🔓 Unlock Basic Photo · $4.99
    </button>

<div id="professional-retouch-card" class="professional-retouch-card">

  <div class="professional-title">
    2. Professional Retouch
  </div>

  <div class="professional-subtitle">
    Compare the standard photo with a studio-quality retouched version.
  </div>

  <div class="professional-features">
    <div>✔ Identity Preserved</div>
    <div>✔ Natural Skin Texture</div>
    <div>✔ Hair Cleanup</div>
    <div>✔ Clothing Cleanup</div>
    <div>✔ Professional Studio Lighting</div>
    <div>✔ Embassy Safe</div>
  </div>

  <label class="professional-international-option">
  <input
    id="professional-international-checkbox"
    type="checkbox">

  <span>
    <strong>Add 3.5 × 4.5 cm international photo</strong>
    <small>Includes both retouched photo sizes · +$3.00</small>
  </span>
</label>

 <button
  id="professional-retouch-btn"
  class="professional-retouch-btn"
  type="button">

  <span class="professional-preview-button-title">
    Preview It Before You Decide
  </span>

  <span class="professional-preview-button-note">
    One complimentary preview per day
  </span>

</button>
  <div
      id="retouch-preview"
      class="retouch-preview"
      style="display:none;">

      <div class="retouch-title">
          Professional Preview
      </div>

      <img
          id="retouch-image"
          alt="Retouch Preview">

      <button id="premium-create-btn" type="button">
         🔓 Unlock Professional Photo · $9.99
      </button>

  </div>

</div>


    <div class="result-help">
      Need help? Contact
      <a href="mailto:usvisaphoto1@gmail.com">usvisaphoto1@gmail.com</a>
    </div>
  </div>
</div>
`;
