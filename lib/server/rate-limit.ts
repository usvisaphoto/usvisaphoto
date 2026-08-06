import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
const globalBuckets = globalThis as typeof globalThis & { __usVisaPhotoRateLimits?: Map<string, Bucket> };
const buckets = globalBuckets.__usVisaPhotoRateLimits ?? new Map<string, Bucket>();
globalBuckets.__usVisaPhotoRateLimits = buckets;

export function enforceRateLimit(req: Request, scope: string, limit: number, windowMs = 60_000) {
  const client = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const key = `${scope}:${client}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many processing requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } }
    );
  }

  current.count += 1;
  return null;
}
