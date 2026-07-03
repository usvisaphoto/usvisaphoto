export const uploadBoxValidation = String.raw`
function runPhotoValidation(landmarks, iw, ih) {
  if (!validationCard) return true;

  validationCard.style.display = 'block';
  validationCard.className = 'validation-card';

  const fail = [];
  const warn = [];

  checkFace.textContent = '✅ Face detected';

  const leftEyeOpen = Math.abs(landmarks[145].y - landmarks[159].y) * ih;
  const rightEyeOpen = Math.abs(landmarks[374].y - landmarks[386].y) * ih;
  const eyesClosed = leftEyeOpen < 3.5 || rightEyeOpen < 3.5;

  checkEyes.textContent = eyesClosed ? '❌ Eyes may be closed' : '✅ Eyes open';
  if (eyesClosed) fail.push('Eyes may be closed');

  const mouthOpen = Math.abs(landmarks[14].y - landmarks[13].y) * ih;
  const smilingOrOpen = mouthOpen > 8;

  checkMouth.textContent = smilingOrOpen
    ? '⚠️ Mouth may be open or smiling'
    : '✅ Mouth closed';

  if (smilingOrOpen) warn.push('Mouth may be open or smiling');

  const eyeDistance = Math.abs(landmarks[263].x - landmarks[33].x) * iw;
  const possibleGlasses = eyeDistance > 65;

  checkGlasses.textContent = possibleGlasses
    ? '❌ Glasses check required'
    : '✅ No obvious glasses detected';

  if (possibleGlasses) fail.push('Glasses may be detected');

  checkPosition.textContent = '✅ Head position detected';

  if (fail.length > 0) {
    validationCard.className = 'validation-card validation-error';
    validationFinal.innerHTML =
      '❌ Photo cannot be created yet.<br>Please upload another photo without glasses and with both eyes open.';
    if (createBtn) createBtn.disabled = true;
    return false;
  }

  if (warn.length > 0) {
    validationCard.className = 'validation-card validation-warning';
    validationFinal.innerHTML =
      '⚠️ Please review warnings before creating.<br>Mouth should be closed with no visible teeth.';
    if (createBtn) createBtn.disabled = false;
    return true;
  }

 const chinBottomSpaceRatio = 1 - landmarks[152].y;

if (chinBottomSpaceRatio < 0.22) {
  validationCard.className = 'validation-card validation-error';
  checkFace.textContent = '❌ Photo validation failed';
  checkPosition.textContent = '❌ Both shoulders visible';
  validationFinal.innerHTML =
    '❌ Both shoulders must be visible.<br>' +
    'Please retake your photo from farther away.';
 if (createBtn) createBtn.disabled = true;
    return false;
}
  validationFinal.textContent = '✅ Ready to Create Photo';
  if (createBtn) createBtn.disabled = false;
  return true;
}
`;