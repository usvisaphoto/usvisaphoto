import { uploadBoxStyles } from "./styles";
import { uploadBoxMarkup } from "./markup";
import { uploadBoxLogic } from "./logic";

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
${uploadBoxLogic}
</script>
</body>
</html>
`;
