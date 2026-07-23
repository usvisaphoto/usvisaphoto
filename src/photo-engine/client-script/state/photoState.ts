export const photoStateScript = String.raw`
const PHOTO_STORAGE_KEYS = Object.freeze({
  state: 'usvisa_photo_state',
  cleanPhoto: 'usvisa_clean_photo',
  pendingCleanPhoto: 'usvisa_pending_clean_photo',
  protectedPreview: 'usvisa_protected_preview',
  downloadCount: 'usvisa_download_count',
  pendingInternationalPhoto: 'usvisa_pending_international_photo',
  pendingProfessionalPhoto: 'usvisa_pending_professional_photo',
  pendingProfessionalInternationalPhoto: 'usvisa_pending_professional_international_photo'
});

const MAX_DOWNLOAD_COUNT = 5;
const PHOTO_STATE_KEY = PHOTO_STORAGE_KEYS.state;

const PHOTO_PRODUCT_IDS = Object.freeze({
  basic: 'basic',
  basicInternational: 'basic-international',
  professional: 'professional',
  professionalInternational: 'professional-international',
  expert: 'expert'
});

function getPhotoState() {
  try {
    const raw = window.parent.localStorage.getItem(PHOTO_STATE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error('PHOTO STATE READ ERROR:', error);
    return {};
  }
}

function savePhotoState(nextState) {
  const currentState = getPhotoState();
  const mergedState = {
    ...currentState,
    ...nextState
  };

  window.parent.localStorage.setItem(
    PHOTO_STATE_KEY,
    JSON.stringify(mergedState)
  );

  return mergedState;
}

function clearPhotoState() {
  window.parent.localStorage.removeItem(PHOTO_STATE_KEY);
}

function getStoredPhotoAssets() {
  return {
    cleanPhoto: window.parent.localStorage.getItem(
      PHOTO_STORAGE_KEYS.cleanPhoto
    ),
    protectedPreview: window.parent.localStorage.getItem(
      PHOTO_STORAGE_KEYS.protectedPreview
    )
  };
}

function saveCleanPhotoAsset(cleanPhoto) {
  window.parent.localStorage.setItem(
    PHOTO_STORAGE_KEYS.cleanPhoto,
    cleanPhoto
  );

  window.parent.localStorage.setItem(
    PHOTO_STORAGE_KEYS.downloadCount,
    '0'
  );

  savePhotoState({
    downloadCount: 0
  });
}

function saveProtectedPreviewAsset(protectedPreview) {
  window.parent.localStorage.setItem(
    PHOTO_STORAGE_KEYS.protectedPreview,
    protectedPreview
  );

  return protectedPreview;
}

function clearPhotoPaymentAssets() {
  window.parent.localStorage.removeItem(PHOTO_STORAGE_KEYS.cleanPhoto);
  window.parent.localStorage.removeItem(PHOTO_STORAGE_KEYS.downloadCount);
  window.parent.localStorage.removeItem(PHOTO_STORAGE_KEYS.pendingCleanPhoto);
  window.parent.localStorage.removeItem(PHOTO_STORAGE_KEYS.protectedPreview);
}

function saveAutoDetectResult(result) {
  const nextResult = result || {};

  return savePhotoState({
    autoDetect: {
      fingerprint: nextResult.fingerprint || '',
      status: nextResult.status || 'unknown',
      passed: nextResult.passed === true,
      recoverable: nextResult.recoverable === true,
      message: nextResult.message || '',
      report: nextResult.report || null,
      updatedAt: new Date().toISOString()
    }
  });
}

function clearAutoDetectResult() {
  return savePhotoState({
    autoDetect: null
  });
}

function getStoredAutoDetectResult(fingerprint) {
  const photoState = getPhotoState();
  const autoDetect = photoState.autoDetect;

  if (!autoDetect || typeof autoDetect !== 'object') {
    return null;
  }

  if (
    fingerprint &&
    autoDetect.fingerprint &&
    autoDetect.fingerprint !== fingerprint
  ) {
    return null;
  }

  return autoDetect;
}

function saveAutoDetectPass(fingerprint, report) {
  return saveAutoDetectResult({
    fingerprint,
    status: 'pass',
    passed: true,
    recoverable: false,
    message: 'Auto detection passed.',
    report: report || null
  });
}

function saveAutoDetectDeny(fingerprint, message) {
  return saveAutoDetectResult({
    fingerprint,
    status: 'deny',
    passed: false,
    recoverable: false,
    message: message || 'Auto detection failed.',
    report: null
  });
}

function saveAutoDetectRecoverable(fingerprint, message, report) {
  return saveAutoDetectResult({
    fingerprint,
    status: 'recoverable',
    passed: false,
    recoverable: true,
    message:
      message ||
      'This photo is eligible for Professional Retouch.',
    report: report || null
  });
}

function getPhotoPaymentStatus() {
  const searchParams = new URLSearchParams(
    window.parent.location.search
  );

  const product = searchParams.get('product') || 'basic';

  return {
    isPaid: searchParams.get('paid') === '1',
    product
  };
}

function getSelectedPhotoPackageStatus() {
  const selectedBasicInput = document.querySelector(
    'input[name="photoType"]:checked'
  );

  const basicPackage =
    selectedBasicInput &&
    selectedBasicInput.value === 'visa-plus-international'
      ? 'visa-plus-international'
      : 'visa-only';

  const professionalInternationalCheckbox =
    document.getElementById('professional-international-checkbox');

  const professionalWithInternational = Boolean(
    professionalInternationalCheckbox &&
    professionalInternationalCheckbox.checked
  );

  return {
    basicPackage,
    basicProduct:
      basicPackage === 'visa-plus-international'
        ? PHOTO_PRODUCT_IDS.basicInternational
        : PHOTO_PRODUCT_IDS.basic,
    isBasicInternational:
      basicPackage === 'visa-plus-international',
    professionalProduct:
      professionalWithInternational
        ? PHOTO_PRODUCT_IDS.professionalInternational
        : PHOTO_PRODUCT_IDS.professional,
    professionalWithInternational
  };
}

function getBasicCheckoutButtonLabel(packageStatus) {
  const status =
    packageStatus || getSelectedPhotoPackageStatus();

  return status.isBasicInternational
    ? '🔓 Unlock Both Photo Sizes · $7.99'
    : '🔓 Unlock HD Photo · $4.99';
}

function getProfessionalCheckoutButtonLabel(packageStatus) {
  const status =
    packageStatus || getSelectedPhotoPackageStatus();

  return status.professionalWithInternational
    ? '🔓 Unlock Professional Photos · $12.99'
    : '🔓 Unlock Professional Photo · $9.99';
}

function getBasicCheckoutUiStatus(paymentStatus, packageStatus) {
  const payment =
    paymentStatus || getPhotoPaymentStatus();

  const selectedPackage =
    packageStatus || getSelectedPhotoPackageStatus();

  if (payment.isPaid) {
    return {
      buttonLabel: 'Download Photo',
      downloadEnabled: true,
      showBasicPackageNote: false,
      showInternationalInfo: selectedPackage.isBasicInternational,
      showInternationalWarning: selectedPackage.isBasicInternational
    };
  }

  return {
    buttonLabel: getBasicCheckoutButtonLabel(selectedPackage),
    downloadEnabled: null,
    showBasicPackageNote: !selectedPackage.isBasicInternational,
    showInternationalInfo: selectedPackage.isBasicInternational,
    showInternationalWarning: selectedPackage.isBasicInternational
  };
}

function getProfessionalPreviewDailyKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return 'usvisa_professional_preview_used_' +
    year + '-' + month + '-' + day;
}

function getProfessionalPreviewUsageStatus(savedProfessionalPhoto) {
  const savedPhoto =
    savedProfessionalPhoto ||
    window.parent.localStorage.getItem(
      PHOTO_STORAGE_KEYS.pendingProfessionalPhoto
    );

  const dailyKey = getProfessionalPreviewDailyKey();
  const hasUsedToday =
    window.parent.localStorage.getItem(dailyKey) === '1';
  const hasSavedProfessionalPhoto = Boolean(savedPhoto);

  return {
    dailyKey,
    hasUsedToday,
    savedProfessionalPhoto: savedPhoto,
    hasSavedProfessionalPhoto,
    canGeneratePreview: !hasUsedToday,
    canRestoreSavedPreview:
      hasUsedToday && hasSavedProfessionalPhoto,
    buttonDisabled:
      hasUsedToday && !hasSavedProfessionalPhoto
  };
}

function getProfessionalPreviewButtonHtml(usageStatus) {
  const status =
    usageStatus || getProfessionalPreviewUsageStatus();

  if (
    status.hasUsedToday &&
    status.hasSavedProfessionalPhoto
  ) {
    return (
      '<span class="professional-preview-button-title">' +
      'View Saved Professional Preview' +
      '</span>' +
      '<span class="professional-preview-button-note">' +
      'No new preview will be generated' +
      '</span>'
    );
  }

  if (status.hasUsedToday) {
    return (
      '<span class="professional-preview-button-title">' +
      'Daily Preview Already Used' +
      '</span>' +
      '<span class="professional-preview-button-note">' +
      'Available again tomorrow' +
      '</span>'
    );
  }

  return getProfessionalCheckoutButtonLabel();
}

function markProfessionalPreviewUsedToday() {
  window.parent.localStorage.setItem(
    getProfessionalPreviewDailyKey(),
    '1'
  );
}

function getCreatePhotoGateStatus(options) {
  const gateOptions = options || {};
  const photoState =
    gateOptions.photoState || getPhotoState();
  const fingerprint =
    gateOptions.fingerprint || '';
  const isPreviouslyCreated =
    Boolean(
      fingerprint &&
      photoState.fingerprint === fingerprint &&
      photoState.created === true
    );
  const hasUploadedPhoto = Boolean(
    gateOptions.uploadedImg &&
    gateOptions.uploadedFile
  );
  const hasPassedValidation = Boolean(
    gateOptions.photoValidationPassed &&
    gateOptions.lockedDetection
  );

  if (isPreviouslyCreated) {
    return {
      canCreate: false,
      shouldRestorePreviousPhoto: true,
      reason: 'alreadyCreated',
      message: ''
    };
  }

  if (!hasUploadedPhoto) {
    return {
      canCreate: false,
      shouldRestorePreviousPhoto: false,
      reason: 'missingUpload',
      message: 'Please upload a photo first.'
    };
  }

  if (!hasPassedValidation) {
    return {
      canCreate: false,
      shouldRestorePreviousPhoto: false,
      reason: 'validationRequired',
      message: 'Please click Auto Detect before creating your photo.'
    };
  }

  return {
    canCreate: true,
    shouldRestorePreviousPhoto: false,
    reason: 'ready',
    message: ''
  };
}

function normalizeDownloadCount(value) {
  const count = Number(value || 0);

  if (!Number.isFinite(count)) {
    return 0;
  }

  return Math.max(0, Math.floor(count));
}

function getPhotoDownloadCount(fallbackCount) {
  const storedCount = window.parent.localStorage.getItem(
    PHOTO_STORAGE_KEYS.downloadCount
  );

  return normalizeDownloadCount(storedCount || fallbackCount);
}

function getPhotoDownloadStatus(currentCount) {
  const count = normalizeDownloadCount(currentCount);
  const remaining = Math.max(0, MAX_DOWNLOAD_COUNT - count);

  return {
    count,
    remaining,
    limit: MAX_DOWNLOAD_COUNT,
    canDownload: remaining > 0
  };
}

function getPhotoDownloadLimitMessage() {
  return (
    'You can download your files up to <b>' +
    MAX_DOWNLOAD_COUNT +
    ' times</b>.'
  );
}

function recordPhotoDownload(currentCount) {
  const nextCount = normalizeDownloadCount(currentCount) + 1;

  window.parent.localStorage.setItem(
    PHOTO_STORAGE_KEYS.downloadCount,
    String(nextCount)
  );

  savePhotoState({
    downloadCount: nextCount
  });

  return getPhotoDownloadStatus(nextCount);
}
`;
