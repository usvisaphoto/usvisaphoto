import { poseValidationLogic } from "./poseValidation";
import { eyeValidationLogic } from "./eyeValidation";
import { uploadBoxGeometry } from "./geometry";
import { uploadBoxValidation } from "./validation";
import { uploadBoxStyles } from "./styles";
import { uploadBoxMarkup } from "./markup";
import { uploadBoxLogic } from "./logic";
import { faceDirectionLogic } from "./faceDirection";
import { mouthValidationLogic } from "./mouthValidation";
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
<<<<<<< HEAD
${mouthValidationLogic}
=======
${poseValidationLogic}
>>>>>>> 617e364 (Blob upload test)
${uploadBoxLogic}
</script>
</body>
</html>
`;