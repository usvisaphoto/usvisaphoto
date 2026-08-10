export const uploadBoxMarkup = String.raw`
<main class="wrap">
  <section class="upload-zone" id="upload-zone" aria-label="Photo upload">
    <input type="file" id="file-input" accept="image/jpeg,image/png,image/webp" aria-label="Choose a portrait photo" />
    <div class="placeholder" id="placeholder"><div class="icon" aria-hidden="true">↑</div><p>Upload your photo</p><small>JPEG, PNG, or WebP · Maximum 15 MB</small></div>
    <img id="preview-img" alt="Your selected photo preview" />
    <div class="guide-line" id="crown-line"><span>Crown</span></div>
    <div class="guide-line" id="chin-line"><span>Chin</span></div>
  </section>

  <div class="actions" aria-label="Photo validation actions">
    <button id="detect-btn" type="button">Auto Detect</button>
    <button id="create-btn" type="button" disabled>Create Photo</button>
  </div>
  <button id="new-photo-btn" type="button" class="new-photo-btn">Choose another photo</button>
  <p class="guide-note" id="guideNote">Upload a photo, then choose Auto Detect. Nothing runs automatically.</p>

  <section id="validation-card" class="validation-card" style="display:none;" aria-live="polite">
    <div class="validation-title">Embassy Photo Validation Report</div>
    <div id="check-face" class="validation-row">Checking face…</div>
    <div id="check-eyes" class="validation-row">Checking eyes…</div>
    <div id="check-mouth" class="validation-row">Checking expression…</div>
    <div id="check-glasses" class="validation-row">Checking eyewear…</div>
    <div id="check-eyebrows" class="validation-row" style="display:none;">Checking eyebrow clearance...</div>
    <div id="check-position" class="validation-row">Checking head position…</div>
    <div id="validation-final" class="validation-final"></div>
  </section>

  <div class="status" id="status" role="status">Upload a photo to begin</div>
  <aside class="notice" id="uploadTips"><strong>For the best result</strong><br />Look directly at the camera, keep both eyes open, close your mouth, and remove glasses, hats, or head coverings.<br /><br />Need help? <a href="mailto:usvisaphoto1@gmail.com">Contact our photo team</a>.</aside>

  <section id="resultPanel" class="result-panel">
    <h2 class="result-title">Your Prepared Photo Preview</h2>
    <p class="result-subtitle">Review your protected preview, then choose Embassy-Ready Upgrade to prepare the final photo.</p>
    <div class="result-canvas-wrap">
      <div class="result-badge"><div id="result-badge-title" class="badge-title">Validated Preview</div><div id="result-badge-subtitle" class="badge-subtitle">Protected · Not final download</div></div>
      <canvas id="result-canvas" width="600" height="600" aria-label="Prepared photo preview"></canvas>
      <canvas id="overlay-canvas" width="600" height="600" aria-hidden="true"></canvas>
    </div>

<div id="eru-included-note" class="eru-included-note">
  <strong>✓ EMBASSY-READY UPGRADE</strong>
  <span>
    Your final Embassy-Ready photo will be prepared after review.
  </span>
</div>

    <div id="photo-type-card" class="photo-type-card" style="display:none;" aria-hidden="true">
      <div class="size-picker" aria-label="Internal preview photo sizes">
        <div class="default-size-card"><span>Default size</span><strong id="primary-photo-name">U.S. Visa Photo</strong><small id="primary-photo-size">2 × 2 inch</small></div>
        <div class="size-option-grid"><label class="size-option size-option-none"><input type="radio" name="photoType" value="visa-only" checked /><span>Default only</span></label></div>
      </div>
      <div id="basic-package-note" class="basic-package-note"></div>
      <div id="international-package-info" class="international-package-info"></div>
      <div id="international-photo-warning" class="international-photo-warning"></div>
      <div id="basic-eyebrow-note" class="eyebrow-clearance-note"></div>
      <div id="basic-download-spec" class="download-spec" aria-live="polite"></div>
    </div>
    <button id="download-btn" type="button" style="display:none;" aria-hidden="true">Internal Preview</button>

    <section id="professional-retouch-card" class="professional-retouch-card">
      <div class="professional-title">1. Embassy-Ready Upgrade</div>
      <div style="display:flex;align-items:baseline;gap:8px;margin:8px 0 10px;"><span style="text-decoration:line-through;opacity:.5;font-weight:800;">$14.99</span><strong style="font-size:26px;color:#0f766e;">$9.99</strong><span style="font-size:11px;font-weight:900;color:#92400e;background:#fef3c7;border-radius:999px;padding:4px 8px;">GRAND OPENING · 33% OFF</span></div>
      <p class="professional-subtitle">Professional preparation for most photos. Start it only when you are ready to preview the upgraded result.</p>
      <div class="professional-features"><div>✓ Embassy photo validation</div><div>✓ Identity preserved</div><div>✓ Natural skin texture</div><div>✓ Hair and clothing cleanup</div><div>✓ Balanced studio lighting</div><div>✓ Glasses removal when possible</div><div>✓ Protected preview before payment</div><div>✓ We stand behind every photo</div><div> ✓ ★Includes your validated prepared photo</div></div>
      <div class="size-picker size-picker-professional" aria-label="Embassy-Ready Upgrade photo sizes">
  <div class="size-picker-heading">
    <strong>Add extra photo sizes</strong>
    <span>Each additional size +$3.00</span>
  </div>

  <div class="size-option-grid">

    <label class="size-option size-option-none">
      <span>Default size</span>
      <small>Included</small>
    </label>

    <label class="size-option" data-size-key="35x45">
      <input type="checkbox" name="professionalExtraSize" value="35x45" />
      <span>3.5 × 4.5 cm</span>
      <small>+$3.00</small>
    </label>

    <label class="size-option" data-size-key="2x2">
      <input type="checkbox" name="professionalExtraSize" value="2x2" />
      <span>2 × 2 inch</span>
      <small>+$3.00</small>
    </label>

    <label class="size-option" data-size-key="30x40">
      <input type="checkbox" name="professionalExtraSize" value="30x40" />
      <span>3 × 4 cm</span>
      <small>+$3.00</small>
    </label>

    <label class="size-option" data-size-key="20x30">
      <input type="checkbox" name="professionalExtraSize" value="20x30" />
      <span>2 × 3 cm</span>
      <small>+$3.00</small>
    </label>

    <label class="size-option" data-size-key="40x60">
      <input type="checkbox" name="professionalExtraSize" value="40x60" />
      <span>4 × 6 cm</span>
      <small>+$3.00</small>
    </label>

    <label class="size-option" data-size-key="50x70">
      <input type="checkbox" name="professionalExtraSize" value="50x70" />
      <span>5 × 7 cm</span>
      <small>+$3.00</small>
    </label>

  </div>

  <div id="eru-total-price" style="margin-top:12px;font-size:16px;font-weight:900;">
    Total · $9.99
  </div>
</div>
      <div id="eru-eyebrow-note" class="eyebrow-clearance-note"></div>
      <div id="eru-download-spec" class="download-spec download-spec-eru" aria-live="polite"></div>
      <button id="professional-retouch-btn" class="professional-retouch-btn" type="button"><span class="professional-preview-button-title">Start Embassy-Ready Upgrade</span><span class="professional-preview-button-note">Runs only when you press this button</span></button>
      <div id="eru-progress" class="eru-progress" hidden aria-live="polite"><div class="eru-progress-copy"><span id="eru-progress-label">Preparing upgrade…</span><strong id="eru-progress-value">0%</strong></div><div class="eru-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="eru-progress-bar" class="eru-progress-bar"></div></div><small>Progress follows the live processing request. Keep this window open.</small></div>
      <div id="retouch-preview" class="retouch-preview" style="display:none;"><div class="retouch-title">Protected Embassy-Ready Preview</div><img id="retouch-image" alt="Embassy-Ready Upgrade preview" /><button id="premium-create-btn" type="button">Unlock Embassy-Ready Photo · $9.99</button></div>
    </section>
    <div class="result-help"><strong>We Stand Behind Every Photo.</strong> Need help? <a href="mailto:usvisaphoto1@gmail.com">Contact our photo team</a>.</div>
  </section>

  <section id="expert-edit-card" class="expert-manual-card">
    <div class="expert-service-badge">PERSONAL SPECIALIST SERVICE</div>
    <h2 class="expert-title">2. Expert Manual Editing</h2>
    <div style="display:flex;align-items:baseline;gap:8px;margin:8px 0 10px;"><span style="text-decoration:line-through;opacity:.5;font-weight:800;">$29.99</span><strong style="font-size:26px;">$19.99</strong><span style="font-size:11px;font-weight:900;background:#fef3c7;color:#92400e;border-radius:999px;padding:4px 8px;">GRAND OPENING · 33% OFF</span></div>
    <p class="expert-subtitle">For difficult photos that need individual specialist attention.</p>
    <div class="expert-highlight">An experienced photo specialist personally reviews, retouches, and checks every order. We stay with you until the photo is right.</div>
    <div class="expert-features"><div>✓ Manual specialist review</div><div>✓ Embassy compliance assessment</div><div>✓ Natural professional retouch</div><div>✓ Priority delivery within 24 hours</div></div>
    <button id="expert-edit-btn" type="button"><span class="expert-button-title">Start Manual Editing</span><span class="expert-button-price">$19.99</span></button>
  </section>
</main>
`;
