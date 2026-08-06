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
    <h2 class="result-title">1. Basic Photo</h2>
    <p class="result-subtitle">After a PASS result, preview your prepared photo and select a package.</p>
    <div class="result-canvas-wrap">
      <div class="result-badge"><div id="result-badge-title" class="badge-title">Embassy-Ready</div><div id="result-badge-subtitle" class="badge-subtitle">2 × 2 inch · 300 DPI</div></div>
      <canvas id="result-canvas" width="600" height="600" aria-label="Prepared photo preview"></canvas>
      <canvas id="overlay-canvas" width="600" height="600" aria-hidden="true"></canvas>
    </div>

    <div id="photo-type-card" class="photo-type-card">
      <div class="size-picker" aria-label="Basic photo sizes">
        <div class="default-size-card"><span>Default size</span><strong id="primary-photo-name">U.S. Visa Photo</strong><small id="primary-photo-size">2 × 2 inch</small></div>
        <div class="size-picker-heading"><strong>Add one more size</strong><span>Optional · +$3.00</span></div>
        <div class="size-option-grid"><label class="size-option size-option-none"><input type="radio" name="photoType" value="visa-only" checked /><span>Default only</span></label><label class="size-option" data-size-key="35x45"><input type="radio" name="photoType" value="addon-35x45" /><span>3.5 × 4.5 cm</span></label><label class="size-option" data-size-key="2x2"><input type="radio" name="photoType" value="addon-2x2" /><span>2 × 2 inch</span></label><label class="size-option" data-size-key="30x40"><input type="radio" name="photoType" value="addon-30x40" /><span>3 × 4 cm</span></label><label class="size-option" data-size-key="20x30"><input type="radio" name="photoType" value="addon-20x30" /><span>2 × 3 cm</span></label><label class="size-option" data-size-key="40x60"><input type="radio" name="photoType" value="addon-40x60" /><span>4 × 6 cm</span></label></div>
      </div>
      <div id="basic-package-note" class="basic-package-note">One embassy-ready JPG · $4.99</div>
      <div id="international-package-info" class="international-package-info"><strong>Default + selected size · $7.99</strong></div>
      <div id="international-photo-warning" class="international-photo-warning"></div>
      <div id="basic-eyebrow-note" class="eyebrow-clearance-note"></div>
      <div id="basic-download-spec" class="download-spec" aria-live="polite"></div>
    </div>
    <button id="download-btn" type="button">Unlock Basic Photo · $4.99</button>

    <section id="professional-retouch-card" class="professional-retouch-card">
      <div class="professional-title">2. Embassy-Ready Upgrade</div>
      <p class="professional-subtitle">Start this optional upgrade yourself to preview a carefully retouched result.</p>
      <div class="professional-features"><div>✓ Identity preserved</div><div>✓ Natural skin texture</div><div>✓ Hair and clothing cleanup</div><div>✓ Balanced studio lighting</div><div>✓ Embassy-conscious editing</div><div>✓ Protected preview before payment</div></div>
      <div class="size-picker size-picker-professional" aria-label="Embassy-Ready Upgrade photo sizes"><div class="size-picker-heading"><strong>Add one more size</strong><span>Optional · +$3.00</span></div><div class="size-option-grid"><label class="size-option size-option-none"><input type="radio" name="professionalExtraSize" value="" checked /><span>Default only</span></label><label class="size-option" data-size-key="35x45"><input type="radio" name="professionalExtraSize" value="35x45" /><span>3.5 × 4.5 cm</span></label><label class="size-option" data-size-key="2x2"><input type="radio" name="professionalExtraSize" value="2x2" /><span>2 × 2 inch</span></label><label class="size-option" data-size-key="30x40"><input type="radio" name="professionalExtraSize" value="30x40" /><span>3 × 4 cm</span></label><label class="size-option" data-size-key="20x30"><input type="radio" name="professionalExtraSize" value="20x30" /><span>2 × 3 cm</span></label><label class="size-option" data-size-key="40x60"><input type="radio" name="professionalExtraSize" value="40x60" /><span>4 × 6 cm</span></label></div></div>
      <div id="eru-eyebrow-note" class="eyebrow-clearance-note"></div>
      <div id="eru-download-spec" class="download-spec download-spec-eru" aria-live="polite"></div>
      <button id="professional-retouch-btn" class="professional-retouch-btn" type="button"><span class="professional-preview-button-title">Start Embassy-Ready Upgrade</span><span class="professional-preview-button-note">Runs only when you press this button</span></button>
      <div id="eru-progress" class="eru-progress" hidden aria-live="polite"><div class="eru-progress-copy"><span id="eru-progress-label">Preparing upgrade…</span><strong id="eru-progress-value">0%</strong></div><div class="eru-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="eru-progress-bar" class="eru-progress-bar"></div></div><small>Progress follows the live processing request. Keep this window open.</small></div>
      <div id="retouch-preview" class="retouch-preview" style="display:none;"><div class="retouch-title">Protected Professional Preview</div><img id="retouch-image" alt="Professional retouch preview" /><button id="premium-create-btn" type="button">Unlock Professional Photo · $9.99</button></div>
    </section>
    <div class="result-help">Need help? <a href="mailto:usvisaphoto1@gmail.com">Contact our photo team</a>.</div>
  </section>

  <section id="expert-edit-card" class="expert-manual-card">
    <div class="expert-service-badge">PREMIUM MANUAL SERVICE</div>
    <h2 class="expert-title">3. Expert Manual Editing</h2>
    <p class="expert-subtitle">For photos that cannot receive an automatic PASS or need specialist review.</p>
    <div class="expert-highlight">An experienced photo specialist personally reviews, retouches, and checks every order.</div>
    <div class="expert-features"><div>✓ Manual specialist review</div><div>✓ Embassy compliance assessment</div><div>✓ Natural professional retouch</div><div>✓ Priority delivery within 24 hours</div></div>
    <button id="expert-edit-btn" type="button"><span class="expert-button-title">Start Manual Editing</span><span class="expert-button-price">$19.99</span></button>
  </section>
</main>
`;
