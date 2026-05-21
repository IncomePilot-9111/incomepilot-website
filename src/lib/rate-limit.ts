/**
 * In-process rate limiter.
 *
 * LIMITATIONS (documented — not hidden):
 *   - Per-lambda-instance: each Vercel serverless function container keeps
 *     its own counter. On cold-start the counter resets.
 *   - Not globally distributed: two concurrent lambda instances can each
 *     allow maxRequests within the same window.
 *
 * For strict global rate limiting, replace this with Upstash Redis or
 * Vercel KV:
 *   https://vercel.com/docs/storage/vercel-kv
 *   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Despite the per-instance limitation this still meaningfully reduces
 * load-amplification abuse and makes each individual lambda more resilient.
 */

interface RateLimitEntry {
  count:   number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/** Prune expired entries to prevent unbounded memory growth in long-lived
 *  lambda containers.  Runs lazily on each call, bounded to O(n) once
 *  per PRUNE_INTERVAL_MS. */
let lastPruneAt = 0
const PRUNE_INTERVAL_MS = 60_000

function maybePrune() {
  const now = Date.now()
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return
  lastPruneAt = now
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed:        boolean
  retryAfterSecs: number   // 0 when allowed
}

/**
 * @param key          Identifier for the bucket (e.g. IP + route).
 * @param maxRequests  Maximum requests allowed in the window.
 * @param windowMs     Window duration in milliseconds.
 */
export function rateLimit(
  key:         string,
  maxRequests: number,
  windowMs:    number,
): RateLimitResult {
  maybePrune()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSecs: 0 }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed:        false,
      retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count += 1
  return { allowed: true, retryAfterSecs: 0 }
}
