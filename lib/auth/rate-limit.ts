/**
 * Small in-memory sliding-window limiter. Good enough for one local process;
 * a hosted deployment needs a shared store (remaining_work.md).
 */
type Bucket = number[];
const buckets = (globalThis as unknown as { __msRate?: Map<string, Bucket> }).__msRate ?? new Map<string, Bucket>();
(globalThis as unknown as { __msRate?: Map<string, Bucket> }).__msRate = buckets;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (bucket.length >= limit) {
    buckets.set(key, bucket);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - bucket[0]!)) / 1000) };
  }
  bucket.push(now);
  buckets.set(key, bucket);
  return { ok: true, retryAfterSec: 0 };
}
