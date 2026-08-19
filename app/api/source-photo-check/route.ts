import { NextResponse } from "next/server";
import OpenAI from "openai";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type SourceType =
  | "DIGITAL"
  | "PRINTED_PHOTO"
  | "PHOTO_OF_PHOTO"
  | "SCREEN_CAPTURE"
  | "UNCERTAIN";

const VALID_SOURCES: SourceType[] = [
  "DIGITAL",
  "PRINTED_PHOTO",
  "PHOTO_OF_PHOTO",
  "SCREEN_CAPTURE",
  "UNCERTAIN",
];

const VALID_EVIDENCE = [
  "PRINT_HALFTONE_PATTERN",
  "PHOTO_PAPER_TEXTURE",
  "SCANNER_ARTIFACTS",
  "PHYSICAL_PRINT_DAMAGE",

  "PAPER_EDGE_WITH_SURROUNDING_SURFACE",
  "PAPER_SHEET_PERSPECTIVE_DISTORTION",
  "PAPER_CAST_SHADOW",
  "PAPER_SURFACE_GLARE",
  "HAND_HOLDING_PRINT",

  "DEVICE_BEZEL_VISIBLE",
  "APP_OR_BROWSER_UI_VISIBLE",
  "CURSOR_OR_STATUS_BAR_VISIBLE",
  "SCREEN_PIXEL_GRID_OR_MOIRE",
  "DISPLAY_REFLECTION_OR_DISPLAY_EDGE",
] as const;

type EvidenceCode = (typeof VALID_EVIDENCE)[number];

type StrongSourceType =
  | "PRINTED_PHOTO"
  | "PHOTO_OF_PHOTO"
  | "SCREEN_CAPTURE";

type RawSourceResult = {
  source?: unknown;
  confidence?: unknown;
  visibleEvidence?: unknown;
};

type SourceResult = {
  source: SourceType;
  confidence: number;
  visibleEvidence: EvidenceCode[];
};

/*
 * 이 값만 변경하면 Expert 강제 판정 임계값을 조정할 수 있습니다.
 *
 * 예:
 * 0.90 = 현재 기준
 * 0.93 = 조금 더 보수적
 * 0.95 = 매우 명확한 경우에만 확정
 */
const STRONG_SOURCE_CONFIDENCE = 0.9;

const ALLOWED_EVIDENCE_BY_SOURCE: Record<
  StrongSourceType,
  readonly EvidenceCode[]
> = {
  PRINTED_PHOTO: [
    "PRINT_HALFTONE_PATTERN",
    "PHOTO_PAPER_TEXTURE",
    "SCANNER_ARTIFACTS",
    "PHYSICAL_PRINT_DAMAGE",
  ],

  PHOTO_OF_PHOTO: [
    "PAPER_EDGE_WITH_SURROUNDING_SURFACE",
    "PAPER_SHEET_PERSPECTIVE_DISTORTION",
    "PAPER_CAST_SHADOW",
    "PAPER_SURFACE_GLARE",
    "HAND_HOLDING_PRINT",
  ],

  SCREEN_CAPTURE: [
    "DEVICE_BEZEL_VISIBLE",
    "APP_OR_BROWSER_UI_VISIBLE",
    "CURSOR_OR_STATUS_BAR_VISIBLE",
    "SCREEN_PIXEL_GRID_OR_MOIRE",
    "DISPLAY_REFLECTION_OR_DISPLAY_EDGE",
  ],
};


/*
 * 종이 경계와 종이 원근 왜곡은 같은 경계에서 함께 추론될 수 있으므로
 * 두 개가 반환되어도 서로 독립적인 물리 증거로 보지 않습니다.
 *
 * PHOTO_OF_PHOTO를 확정하려면 아래 증거 중 하나가 추가로 필요합니다.
 */
const PHOTO_OF_PHOTO_DECISIVE_EVIDENCE: readonly EvidenceCode[] = [
  "PAPER_CAST_SHADOW",
  "PAPER_SURFACE_GLARE",
  "HAND_HOLDING_PRINT",
];


function isStrongSource(
  source: SourceType
): source is StrongSourceType {
  return (
    source === "PRINTED_PHOTO" ||
    source === "PHOTO_OF_PHOTO" ||
    source === "SCREEN_CAPTURE"
  );
}

function isEvidenceCode(
  value: unknown
): value is EvidenceCode {
  return (
    typeof value === "string" &&
    VALID_EVIDENCE.includes(value as EvidenceCode)
  );
}

function fallbackResult(): SourceResult {
  return {
    source: "UNCERTAIN",
    confidence: 0,
    visibleEvidence: [],
  };
}

function normalize(value: unknown): SourceResult {
  if (!value || typeof value !== "object") {
    return fallbackResult();
  }

  const result = value as RawSourceResult;

  const rawSource: SourceType =
    typeof result.source === "string" &&
    VALID_SOURCES.includes(result.source as SourceType)
      ? (result.source as SourceType)
      : "UNCERTAIN";

  const confidence =
    typeof result.confidence === "number" &&
    Number.isFinite(result.confidence)
      ? Math.max(0, Math.min(1, result.confidence))
      : 0;

  const visibleEvidence: EvidenceCode[] =
    Array.isArray(result.visibleEvidence)
      ? Array.from(
          new Set(
            result.visibleEvidence
              .filter(isEvidenceCode)
              .slice(0, 6)
          )
        )
      : [];

  /*
   * DIGITAL 또는 UNCERTAIN은 Expert 강제 전환 대상이 아닙니다.
   * 이 경우 모델이 불필요한 evidence를 반환했더라도 제거합니다.
   */
  if (!isStrongSource(rawSource)) {
    return {
      source: rawSource,
      confidence,
      visibleEvidence: [],
    };
  }

  /*
   * 판정 유형에 맞는 강한 증거만 인정합니다.
   *
   * 예:
   * PHOTO_OF_PHOTO인데 DEVICE_BEZEL_VISIBLE만 반환했다면
   * PHOTO_OF_PHOTO의 유효 증거로 인정하지 않습니다.
   */
  const matchingEvidence = visibleEvidence.filter((evidence) =>
    ALLOWED_EVIDENCE_BY_SOURCE[rawSource].includes(evidence)
  );

  /*
   * 다음 두 조건을 모두 만족해야만 Expert 유형을 확정합니다.
   *
   * 1. confidence >= STRONG_SOURCE_CONFIDENCE
   * 2. 해당 source와 일치하는 강한 물리적 증거가 1개 이상 존재
   *
   * 하나라도 충족하지 못하면 UNCERTAIN으로 내려서
   * 일반 얼굴 및 구도 검증을 계속 진행합니다.
   */
  const hasDecisivePhotoOfPhotoEvidence =
  rawSource !== "PHOTO_OF_PHOTO" ||
  matchingEvidence.some((evidence) =>
    PHOTO_OF_PHOTO_DECISIVE_EVIDENCE.includes(evidence)
  );

/*
 * SCREEN_CAPTURE 안전장치
 *
 * CURSOR_OR_STATUS_BAR_VISIBLE은 얼굴/헤어/배경의 작은 형태를
 * UI 요소로 오인할 가능성이 있으므로 이것 하나만으로는
 * SCREEN_CAPTURE를 확정하지 않습니다.
 *
 * 반면 실제 브라우저 UI, 기기 베젤, 모아레/픽셀 그리드,
 * 디스플레이 반사/경계는 단독으로도 직접적인 화면 증거로 봅니다.
 */
const hasDecisiveScreenEvidence =
  rawSource !== "SCREEN_CAPTURE" ||
  matchingEvidence.some(
    (evidence) =>
      evidence === "DEVICE_BEZEL_VISIBLE" ||
      evidence === "APP_OR_BROWSER_UI_VISIBLE" ||
      evidence === "SCREEN_PIXEL_GRID_OR_MOIRE" ||
      evidence === "DISPLAY_REFLECTION_OR_DISPLAY_EDGE"
  );

if (
  confidence < STRONG_SOURCE_CONFIDENCE ||
  matchingEvidence.length === 0 ||
  !hasDecisivePhotoOfPhotoEvidence ||
  !hasDecisiveScreenEvidence
) {
  return {
    source: "UNCERTAIN",
    confidence,
    visibleEvidence: [],
  };
}
  return {
    source: rawSource,
    confidence,
    visibleEvidence: matchingEvidence,
  };
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(
    req,
    "source-photo-check",
    15,
    10 * 60_000
  );

  if (limited) return limited;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        fallbackResult(),
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "No image." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const bytes = Buffer.from(
      await image.arrayBuffer()
    );

    const mimeType =
      image.type && image.type.startsWith("image/")
        ? image.type
        : "image/jpeg";

    const dataUrl =
      `data:${mimeType};base64,${bytes.toString("base64")}`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      /*
       * 고객 사진이 OpenAI Responses API에 저장되지 않도록 설정합니다.
       */
      store: false,

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Classify the source type of this uploaded passport or visa portrait.

This classifier has one narrow purpose:
detect only clearly visible physical prints, photos of physical prints,
screens, or screenshots.

A false positive is harmful because it incorrectly blocks a valid
digital customer photo and sends the customer to manual editing.

Return only JSON matching the supplied schema.

GENERAL DECISION POLICY

1. Judge only direct visual evidence visible in the uploaded image.
2. Never infer physical media from portrait style, image quality,
   passport-photo composition, studio lighting, or background color.
3. Never invent paper edges, screens, glare, texture, devices,
   interfaces, shadows, or surrounding surfaces.
4. If the image can reasonably be an original digital portrait,
   classify it as DIGITAL.
5. If physical-media evidence is suspected but not unmistakable,
   classify it as UNCERTAIN.
6. PRINTED_PHOTO, PHOTO_OF_PHOTO, and SCREEN_CAPTURE require both:
   - confidence of at least 0.90
   - at least one allowed direct evidence code
7. visibleEvidence must contain only allowed evidence codes.
8. For DIGITAL or UNCERTAIN, visibleEvidence must be an empty array.

DIGITAL

Use DIGITAL for:

- an original phone or camera photograph
- an original digital studio portrait
- a clean exported portrait file
- a normal passport or visa style portrait
- a portrait with a white, gray, colored, uneven, or gradient background
- a portrait cropped with empty margins or ordinary white borders

The following are NOT evidence of a physical photograph or screen:

- studio backdrop edges
- wall seams or wall shadows
- lighting gradients
- background color transitions
- vertical or horizontal background lines
- ordinary image crop boundaries
- empty margins
- white or gray borders
- uneven exposure
- brighter image centers or darker image edges
- a portrait that looks professionally retouched
- a portrait that resembles an ID or passport photo
- low resolution by itself
- blur or compression by itself

PRINTED_PHOTO

Use PRINTED_PHOTO only when the uploaded image visibly contains
evidence that it is a scan or digital reproduction of a physical print.

Allowed evidence codes:

- PRINT_HALFTONE_PATTERN
  Use only for a clearly visible printing-dot or halftone pattern.

- PHOTO_PAPER_TEXTURE
  Use only for clear physical photo-paper texture, not skin texture,
  image noise, compression, or a normal background texture.

- SCANNER_ARTIFACTS
  Use only for clear scanner-specific artifacts that cannot reasonably
  be ordinary lighting, blur, compression, or camera noise.

- PHYSICAL_PRINT_DAMAGE
  Use only for visible physical creases, folds, peeling, or damage that
  clearly belongs to a physical print.

A plain border or margin alone is not PRINTED_PHOTO evidence.

PHOTO_OF_PHOTO

Use PHOTO_OF_PHOTO only when a physical photograph has clearly been
photographed again and the physical photograph itself is visibly
distinguishable from its surroundings.

Allowed evidence codes:

- PAPER_EDGE_WITH_SURROUNDING_SURFACE
  An actual paper edge is visible together with a different surrounding
  table, wall, floor, hand, or other physical surface.

- PAPER_SHEET_PERSPECTIVE_DISTORTION
  The physical photo sheet itself has clear keystone or perspective
  distortion. Do not use this for head pose, camera perspective,
  background lines, or an ordinary crop.

- PAPER_CAST_SHADOW
  A shadow is visibly cast by the physical paper sheet onto a separate
  surrounding surface.

- PAPER_SURFACE_GLARE
  Glare clearly follows the surface of a physical photo sheet.
  Do not use this for ordinary facial highlights or studio lighting.

- HAND_HOLDING_PRINT
  A hand or fingers are visibly holding the physical photograph.

Do not classify PHOTO_OF_PHOTO merely because the portrait has a
border, margin, wall line, backdrop edge, uneven lighting, or a
passport-photo appearance.

PAPER_EDGE_WITH_SURROUNDING_SURFACE and
PAPER_SHEET_PERSPECTIVE_DISTORTION are supporting boundary evidence,
not decisive physical evidence. They may both arise from the same
background or canvas boundary.

Do not return PHOTO_OF_PHOTO based only on those two codes, even when
both appear visible. At least one independent decisive physical cue
must also be visible:

- PAPER_CAST_SHADOW
- PAPER_SURFACE_GLARE
- HAND_HOLDING_PRINT

If no decisive physical cue is visible, return UNCERTAIN.


SCREEN_CAPTURE

Use SCREEN_CAPTURE only when direct screen or screenshot evidence
is visible.

Allowed evidence codes:

- DEVICE_BEZEL_VISIBLE
- APP_OR_BROWSER_UI_VISIBLE
- CURSOR_OR_STATUS_BAR_VISIBLE
- SCREEN_PIXEL_GRID_OR_MOIRE
- DISPLAY_REFLECTION_OR_DISPLAY_EDGE

A clean image copied, downloaded, or exported from a phone or computer
without visible interface or screen evidence is not SCREEN_CAPTURE.

FINAL CHECK BEFORE RETURNING A NON-DIGITAL SOURCE

Before returning PRINTED_PHOTO, PHOTO_OF_PHOTO, or SCREEN_CAPTURE:

- Identify the exact allowed evidence code.
- Confirm that the evidence is physically visible.
- Confirm that it is not a wall edge, backdrop transition, crop,
  margin, border, lighting difference, blur, noise, or compression.
- If any of those checks are uncertain, return UNCERTAIN.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "source_photo_check",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: {
                type: "string",
                enum: [
                  "DIGITAL",
                  "PRINTED_PHOTO",
                  "PHOTO_OF_PHOTO",
                  "SCREEN_CAPTURE",
                  "UNCERTAIN",
                ],
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
              visibleEvidence: {
                type: "array",
                items: {
                  type: "string",
                  enum: VALID_EVIDENCE,
                },
                maxItems: 6,
              },
            },
            required: [
              "source",
              "confidence",
              "visibleEvidence",
            ],
          },
        },
      },
    });

    let parsed: unknown = null;

    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      console.error(
        "SOURCE PHOTO CHECK INVALID JSON:",
        response.output_text
      );
    }

    /*
     * RAW 로그:
     * 모델이 최초에 어떤 source와 evidence를 반환했는지 확인합니다.
     */
    console.log(
      "SOURCE PHOTO CHECK RAW:",
      parsed
    );

    const normalized = normalize(parsed);

    /*
     * RESULT 로그:
     * 실제 logic.ts로 전달되는 최종 판정입니다.
     */
    console.log(
      "SOURCE PHOTO CHECK RESULT:",
      {
        source: normalized.source,
        confidence: normalized.confidence,
        visibleEvidence: normalized.visibleEvidence,
      }
    );

    return NextResponse.json(
      normalized,
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "SOURCE PHOTO CHECK ERROR:",
      error
    );

    return NextResponse.json(
      fallbackResult(),
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}