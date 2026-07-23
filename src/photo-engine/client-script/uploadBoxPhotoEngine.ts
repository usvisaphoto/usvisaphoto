import {
  detectedPhotoValidationScript,
  eyeValidationScript,
  faceDirectionScript,
  legacyPhotoValidationScript,
  mouthValidationScript,
  poseValidationScript,
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
${detectedPhotoValidationScript}
`;
