import { poseValidationLogic } from "./poseValidation";
import { eyeValidationLogic } from "./eyeValidation";
import { uploadBoxGeometry } from "./geometry";
import { uploadBoxValidation } from "./validation";
import { uploadBoxStyles } from "./styles";
import { uploadBoxMarkup } from "./markup";
import { uploadBoxLogic } from "./logic";
import { photoStateScript } from "./photoState";
import { faceDirectionLogic } from "./faceDirection";
import { mouthValidationLogic } from "./mouthValidation";

import {
  detectedPhotoValidationScript,
  appearanceValidationScript,
} from "@/src/photo-engine/client-script";

export const uploadBoxHtmlV2 = String.raw`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
${uploadBoxStyles}
</style>
</head>
<body>
${uploadBoxMarkup}
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
<script>
${uploadBoxGeometry}
${uploadBoxValidation}
${faceDirectionLogic}
${eyeValidationLogic}
${mouthValidationLogic}
${poseValidationLogic}
${appearanceValidationScript}
${detectedPhotoValidationScript}
${photoStateScript}
${uploadBoxLogic}
</script>
</body>
</html>
`;