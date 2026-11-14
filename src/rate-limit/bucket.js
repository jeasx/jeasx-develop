/** Tokens a client can spend at once (the burst). */
export const CAPACITY = 5;
/** Tokens refilled per second (the sustained rate). */
export const REFILL_PER_SECOND = 1;

const MAX_CLIENTS = 10_000;

/** @typedef {{ tokens: number, updated: number }} Bucket */

// Each route is bundled on its own; globalThis shares the buckets between them.
// With several server instances, keep the buckets in a shared store like Redis instead.
/** @type {Map<string, Bucket>} */
const buckets = (globalThis.rateLimitBuckets ??= new Map());

/**
 * Token bucket: every request takes one token, and tokens trickle back in over time.
 * Bursts of up to CAPACITY requests pass, but in the long run a client can't send
 * more than REFILL_PER_SECOND requests per second.
 *
 * @param {string} key E.g. the IP address of the client.
 * @returns {{ allowed: boolean, remaining: number, reset: number, retryAfter: number }}
 *   remaining tokens, seconds until the bucket is full again, and seconds until
 *   the next token (0 if allowed).
 */
export function take(key, now = Date.now()) {
  let bucket = buckets.get(key);
  if (bucket) {
    const elapsed = (now - bucket.updated) / 1000;
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_PER_SECOND);
    bucket.updated = now;
    // Move the bucket to the end, so the map stays ordered from least to most recently used.
    buckets.delete(key);
  } else {
    bucket = { tokens: CAPACITY, updated: now };
    prune(now);
  }
  buckets.set(key, bucket);

  const allowed = bucket.tokens >= 1;
  if (allowed) {
    bucket.tokens -= 1;
  }
  return {
    allowed,
    remaining: Math.floor(bucket.tokens),
    reset: Math.ceil((CAPACITY - bucket.tokens) / REFILL_PER_SECOND),
    retryAfter: allowed ? 0 : Math.ceil((1 - bucket.tokens) / REFILL_PER_SECOND),
  };
}

/** Forgets full buckets (they behave like new ones) and caps the memory used. */
function prune(now) {
  const fullAfter = (CAPACITY / REFILL_PER_SECOND) * 1000;
  for (const [key, bucket] of buckets) {
    if (now - bucket.updated < fullAfter && buckets.size < MAX_CLIENTS) {
      break; // The rest was used even more recently.
    }
    buckets.delete(key);
  }
}
