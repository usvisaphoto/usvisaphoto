const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export type ImageUploadResult =
  | { ok: true; file: File }
  | { ok: false; error: string; status: number };

export function validateImageUpload(value: FormDataEntryValue | null): ImageUploadResult {
  if (!(value instanceof File)) return { ok: false, error: "An image file is required.", status: 400 };
  if (!ALLOWED_IMAGE_TYPES.has(value.type)) return { ok: false, error: "Use a JPEG, PNG, or WebP image.", status: 415 };
  if (value.size <= 0) return { ok: false, error: "The uploaded image is empty.", status: 400 };
  if (value.size > MAX_IMAGE_BYTES) return { ok: false, error: "The image must be 15 MB or smaller.", status: 413 };
  return { ok: true, file: value };
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 120_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
