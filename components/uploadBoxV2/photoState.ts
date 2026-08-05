export const photoStateScript = String.raw`
const PHOTO_STATE_KEY = 'usvisa_photo_state';
const CREATED_PHOTO_FINGERPRINT_KEY = 'usvisa_created_photo_fingerprint';
const AUTO_DETECT_VERSION = 2;

function getPhotoState() {
  try {
    const raw =
      window.parent.localStorage.getItem(PHOTO_STATE_KEY);

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

  const mergedState = Object.assign(
    {},
    currentState,
    nextState || {}
  );

  window.parent.localStorage.setItem(
    PHOTO_STATE_KEY,
    JSON.stringify(mergedState)
  );

  return mergedState;
}

function clearPhotoState() {
  window.parent.localStorage.removeItem(
    PHOTO_STATE_KEY
  );
}

function isPhotoAlreadyCreated(fingerprint) {
  if (!fingerprint) {
    return false;
  }

  const state = getPhotoState();

  return (
    state.fingerprint === fingerprint &&
    state.created === true
  );
}

function markPhotoCreated(fingerprint) {
  if (fingerprint) {
    window.parent.localStorage.setItem(
      CREATED_PHOTO_FINGERPRINT_KEY,
      fingerprint
    );
  }

  return savePhotoState({
    fingerprint: fingerprint,
    created: true,
    createdAt: Date.now()
  });
}

function getCreatedPhotoFingerprint() {
  const storedFingerprint =
    window.parent.localStorage.getItem(
      CREATED_PHOTO_FINGERPRINT_KEY
    );

  if (storedFingerprint) {
    return storedFingerprint;
  }

  const state = getPhotoState();

  if (state.created === true && state.fingerprint) {
    return state.fingerprint;
  }

  return '';
}

function isCreatedPhotoForFingerprint(fingerprint) {
  if (!fingerprint) {
    return true;
  }

  return getCreatedPhotoFingerprint() === fingerprint;
}

function setPhotoDownloadCount(downloadCount) {
  return savePhotoState({
    downloadCount: Math.max(
      0,
      Math.floor(Number(downloadCount) || 0)
    )
  });
}

function clearCreatedPhotoState(fingerprint) {
  const state = getPhotoState();

  if (
    fingerprint &&
    state.fingerprint &&
    state.fingerprint !== fingerprint
  ) {
    return state;
  }

  delete state.created;
  delete state.createdAt;
  delete state.downloadCount;

  window.parent.localStorage.removeItem(
    CREATED_PHOTO_FINGERPRINT_KEY
  );

  window.parent.localStorage.setItem(
    PHOTO_STATE_KEY,
    JSON.stringify(state)
  );

  return state;
}

function getStoredAutoDetectResult(fingerprint) {
  if (!fingerprint) {
    return null;
  }

  const state = getPhotoState();
  const result = state.autoDetectResult;

  if (
    !result ||
    result.fingerprint !== fingerprint ||
    result.detectorVersion !== AUTO_DETECT_VERSION
  ) {
    return null;
  }

  return result;
}

function saveAutoDetectResult(result) {
  if (!result || !result.fingerprint) {
    return getPhotoState();
  }

  return savePhotoState({
    fingerprint: result.fingerprint,
    autoDetectResult: Object.assign(
      {
        savedAt: Date.now(),
        detectorVersion: AUTO_DETECT_VERSION
      },
      result
    )
  });
}

function saveAutoDetectPass(fingerprint, detection, report) {
  return saveAutoDetectResult({
    fingerprint: fingerprint,
    status: 'pass',
    detection: detection || null,
    report: report || null
  });
}

function saveAutoDetectDeny(fingerprint, message) {
  return saveAutoDetectResult({
    fingerprint: fingerprint,
    status: 'deny',
    message: message || ''
  });
}

function saveAutoDetectRecoverable(fingerprint, detection, message) {
  return saveAutoDetectResult({
    fingerprint: fingerprint,
    status: 'recoverable',
    detection: detection || null,
    message: message || ''
  });
}

function saveAutoDetectExpertOnly(fingerprint, detection, message, source) {
  return saveAutoDetectResult({
    fingerprint: fingerprint,
    status: 'expert-only',
    detection: detection || null,
    message: message || '',
    source: source || 'UNCERTAIN'
  });
}

function clearAutoDetectResult() {
  const state = getPhotoState();

  delete state.autoDetectResult;

  window.parent.localStorage.setItem(
    PHOTO_STATE_KEY,
    JSON.stringify(state)
  );

  return state;
}
`;
