export const photoFingerprintScript = String.raw`
async function createPhotoFingerprint(file) {
  const fileBuffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    fileBuffer
  );

  const hash = Array.from(
    new Uint8Array(hashBuffer)
  )
    .map(function (byte) {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');

  return [
    hash,
    file.size,
    file.type || 'unknown'
  ].join(':');
}
`;
