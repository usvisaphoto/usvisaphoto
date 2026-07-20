export type PhotoState = {
  fingerprint?: string;
  created?: boolean;
  professionalPreviewUsed?: boolean;
  downloadCount?: number;
};

const PHOTO_STATE_KEY = 'usvisa_photo_state';

export function getPhotoState(): PhotoState {
  try {
    const raw = window.parent.localStorage.getItem(PHOTO_STATE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as PhotoState;
  } catch (error) {
    console.error('PHOTO STATE READ ERROR:', error);
    return {};
  }
}

export function savePhotoState(
  nextState: PhotoState
): PhotoState {
  const currentState = getPhotoState();

  const mergedState: PhotoState = {
    ...currentState,
    ...nextState,
  };

  window.parent.localStorage.setItem(
    PHOTO_STATE_KEY,
    JSON.stringify(mergedState)
  );

  return mergedState;
}

export function clearPhotoState() {
  window.parent.localStorage.removeItem(
    PHOTO_STATE_KEY
  );
}

export function isPhotoAlreadyCreated(
  fingerprint: string
) {
  if (!fingerprint) {
    return false;
  }

  const state = getPhotoState();

  return (
    state.fingerprint === fingerprint &&
    state.created === true
  );
}

export function markPhotoCreated(
  fingerprint: string
) {
  return savePhotoState({
    fingerprint,
    created: true,
  });
}

export function setPhotoDownloadCount(
  downloadCount: number
) {
  return savePhotoState({
    downloadCount: Math.max(
      0,
      Math.floor(downloadCount)
    ),
  });
}