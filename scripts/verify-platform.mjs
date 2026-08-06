import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const logic = read("components/uploadBoxV2/logic.ts");
const markup = read("components/uploadBoxV2/markup.ts");
const state = read("components/uploadBoxV2/photoState.ts");
const glasses = read("src/photo-engine/client-script/validation/glassesValidation.ts");
const hero = read("components/HeroUploadSection.tsx");
const retouchPrompt = read("lib/prompts/professionalRetouch.ts");
const retouchRoute = read("app/api/professional-retouch/route.ts");
const paypalCreateRoute = read("app/api/create-paypal-order/route.ts");
const secureDownloadRoute = read("app/api/download-photos/route.ts");
const securePhotoRoute = read("app/api/secure-photo/route.ts");

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const id of [
  "file-input", "detect-btn", "create-btn", "professional-retouch-btn",
  "eru-progress", "eru-progress-bar", "validation-card", "validation-final",
  "resultPanel", "result-canvas", "download-btn", "expert-edit-btn"
]) check(markup.includes(`id="${id}"`), `Missing required DOM element: ${id}`);

check(state.includes("const AUTO_DETECT_VERSION = 11"), "Validation cache version must be 11");
check(markup.includes('id="check-eyebrows"'), "Missing eyebrow-clearance validation row");
check(logic.includes("COUNTRY_PROFILE.code === 'KR' || COUNTRY_PROFILE.code === 'CN'"), "Korea and China must require eyebrow clearance");
for (const status of ["PASS", "REVIEW", "DENY"])
  check(state.includes(`status: '${status}'`), `Missing validation status: ${status}`);

check(!/professionalRetouchBtn\.click\s*\(/.test(logic), "E.R.U must never be started by synthetic click");
check(!/downloadBtn\.click\s*\(/.test(logic), "Downloads must require a user click");
check(logic.includes("renderEruProgress(100, 'Embassy-Ready Upgrade complete')"), "E.R.U may reach 100% only on completed response path");
check(logic.includes("Math.min(92, 4 +"), "In-flight E.R.U progress must remain below completion");
check(logic.includes("const eruCountdownSeconds = 60"), "E.R.U countdown must be 60 seconds");
check(!logic.includes("retouchCountdown = 75"), "Legacy 75-second countdown must not return");
check(hero.includes('max-w-[48rem]'), "Desktop validator must use the doubled-width layout");
check(retouchPrompt.includes("Follow the destination-specific eyewear policy"), "E.R.U prompt must enforce the destination eyewear policy");
check(retouchRoute.includes("DESTINATION EYEWEAR POLICY — REMOVE"), "Restricted destinations must require complete eyewear removal");
check(retouchRoute.includes("DESTINATION EYEWEAR POLICY — PRESERVE"), "Permitted destinations must preserve eyewear");
check(logic.includes("PROFESSIONAL_PREVIEW_VERSION = 'basic-matched-preview-v8'"), "Old E.R.U previews must be invalidated after composition changes");
check(logic.includes("protectPhotoForCheckout"), "Final photos must be sealed before checkout");
check(!logic.includes("writeStoredPhoto('usvisa_clean_photo', cleanUrl)"), "A clean BASIC photo must not be stored in browser storage");
check(paypalCreateRoute.includes("getDownloadManifest(securePhotoTokens)"), "PayPal orders must bind to the protected photo manifest");
check(secureDownloadRoute.includes('order?.status !== "COMPLETED"'), "Downloads must verify completed PayPal status on the server");
check(secureDownloadRoute.includes("unit?.custom_id !== expectedCustomId"), "Downloads must verify the purchased photo manifest");
check(secureDownloadRoute.includes('unit?.amount?.value !== PRODUCT_PRICES[product]'), "Downloads must verify the paid amount");
check(securePhotoRoute.includes("sealPhoto(buffer)"), "Protected photos must be encrypted before browser storage");

for (const signal of ["temple", "bridge", "frame", "reflection", "evidenceCount", "verdict"])
  check(glasses.includes(signal), `Glasses V2 evidence missing: ${signal}`);

const declarations = [...logic.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map((match) => match[1]);
const duplicates = [...new Set(declarations.filter((name, index) => declarations.indexOf(name) !== index))];
check(duplicates.length === 0, `Duplicate function declarations: ${duplicates.join(", ")}`);

if (failures.length) {
  console.error(`Platform verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Platform invariants verified.");
