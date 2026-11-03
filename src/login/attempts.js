// Every sign-in and registration hashes a password with scrypt, which is slow on purpose.
// Without a limit, anyone could guess passwords quickly or keep the server busy hashing.
// The counts live in memory of this process: a real app keeps them in a shared store
// (e.g. Redis) and also limits attempts per username.

const MAX_ATTEMPTS = 10;
const WINDOW = 60 * 1000;
// Limits keep a public demo from filling up the memory.
const MAX_ENTRIES = 10000;

/** @type {Map<string, { count: number, resetAt: number }>} */
const attempts = new Map();

/**
 * Counts an attempt for the given key (e.g. the IP address).
 * Returns the seconds to wait if there were too many attempts, otherwise 0.
 *
 * @param {string} key
 */
export function countAttempt(key) {
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    // Re-insert, so the map stays ordered by age and the oldest entry comes first.
    attempts.delete(key);
    entry = { count: 0, resetAt: now + WINDOW };
    attempts.set(key, entry);
    if (attempts.size > MAX_ENTRIES) {
      attempts.delete(attempts.keys().next().value);
    }
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS ? Math.ceil((entry.resetAt - now) / 1000) : 0;
}
