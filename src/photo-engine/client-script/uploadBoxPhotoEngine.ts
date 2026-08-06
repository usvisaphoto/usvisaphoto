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
import { alignmentCorrectionScript } from "./correction";

export const uploadBoxPhotoEngineScript = String.raw`
${photoStateScript}
${photoFingerprintScript}
${alignmentCorrectionScript}
${legacyPhotoValidationScript}
${faceDirectionScript}
${eyeValidationScript}
${mouthValidationScript}
${poseValidationScript}
${glassesValidationScript}
${appearanceValidationScript}
${detectedPhotoValidationScript}
`;