import { eyeValidationLogic } from "./eyeValidation";
import { uploadBoxGeometry } from "./geometry";
import { uploadBoxValidation } from "./validation";
import { uploadBoxStyles } from "./styles";
import { uploadBoxMarkup } from "./markup";
import { uploadBoxLogic } from "./logic";
import { faceDirectionLogic } from "./faceDirection";
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
<script>
${uploadBoxGeometry}
${uploadBoxValidation}
${faceDirectionLogic}
${eyeValidationLogic}
${uploadBoxLogic}
</script>
</body>
</html>
`;