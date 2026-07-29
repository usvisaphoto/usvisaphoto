import {
  detectedPhotoValidationScript,
  eyeValidationScript,
  faceDirectionScript,
  legacyPhotoValidationScript,
  mouthValidationScript,
  poseValidationScript,
  glassesValidationScript,
  appearanceValidationScript,
} from "./validation";
import { photoFingerprintScript, photoStateScript } from "./state";

export const uploadBoxPhotoEngineScript = String.raw`
${photoStateScript}
${photoFingerprintScript}
${legacyPhotoValidationScript}
${faceDirectionScript}
${eyeValidationScript}
${mouthValidationScript}
${poseValidationScript}
${glassesValidationScript}
${appearanceValidationScript}
${detectedPhotoValidationScript}
`;