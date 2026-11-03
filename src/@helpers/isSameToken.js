import { timingSafeEqual } from "node:crypto";

/**
 * Compares two tokens in constant time, so response times don't reveal how much of a guess was right.
 *
 * @param {string} actual
 * @param {string} expected
 */
export default function isSameToken(actual, expected) {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
