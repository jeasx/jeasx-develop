import { generateChallenge, validateChallenge } from "capjs-core";
import { createHash, randomBytes } from "node:crypto";

// capjs-core is stateless: challenges are signed with this secret, so it must be
// the same for all processes. Without CAP_SECRET, a random one is generated at startup,
// which invalidates pending challenges and tokens on every restart (fine for a demo).
const SECRET = process.env.CAP_SECRET || (globalThis.capSecret ??= randomBytes(32).toString("hex"));

// What's left to store: the signatures of redeemed challenges (replay protection)
// and the issued tokens. Both are free to produce, so cap the memory: once full,
// the oldest entries are dropped first. A real app uses a shared store with TTL (e.g. Redis).
const MAX_ENTRIES = 10_000;

/** @type {{ nonces: Map<string, number>, tokens: Map<string, number> }} */
const cache = (globalThis.capCache ??= { nonces: new Map(), tokens: new Map() });

/**
 * @param {Map<string, number>} map
 * @param {string} key
 * @param {number} expires
 */
function add(map, key, expires) {
  const now = Date.now();
  map.entries().forEach(([k, e]) => {
    if (e < now) map.delete(k);
  });
  map.set(key, expires);
  if (map.size > MAX_ENTRIES) {
    map.delete(map.keys().next().value);
  }
}

/**
 * Called by capjs-core once per solved challenge. Returns false if it was already redeemed.
 * @param {string} signature
 * @param {number} ttlMs
 */
async function consumeNonce(signature, ttlMs) {
  if ((cache.nonces.get(signature) ?? 0) > Date.now()) {
    return false;
  }
  add(cache.nonces, signature, Date.now() + ttlMs);
  return true;
}

export async function createChallenge() {
  return generateChallenge(SECRET);
}

/**
 * @param {unknown} body
 */
export async function redeemChallenge(body) {
  // Unchecked request body: capjs-core validates its shape and fails with success: false.
  const result = await validateChallenge(
    SECRET,
    /** @type {import("capjs-core").ValidateChallengeBody} */ (body),
    { consumeNonce },
  );
  if (!result.success) {
    return { success: false };
  }
  add(cache.tokens, result.tokenKey, result.expires);
  return { success: true, token: result.token, expires: result.expires };
}

/**
 * Checks a token from a submitted form and deletes it, so it works only once.
 * capjs-core hands out "id:secret" and stores "id:sha256(secret)" as tokenKey.
 * @param {string} token
 */
export function validateToken(token) {
  const [id, secret] = token.split(":");
  if (!id || !secret) {
    return { success: false };
  }
  const key = `${id}:${createHash("sha256").update(secret).digest("hex")}`;
  const expires = cache.tokens.get(key);
  cache.tokens.delete(key);
  return { success: expires > Date.now() };
}
