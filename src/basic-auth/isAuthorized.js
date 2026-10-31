import { timingSafeEqual } from "node:crypto";

const EXPECTED = Buffer.from(`Basic ${Buffer.from("demo:demo").toString("base64")}`);

/**
 * Checks the Authorization header against the demo credentials.
 * Compares in constant time, so response times don't reveal how much of a guess was right.
 *
 * @param {string | undefined} authorization
 */
export default function isAuthorized(authorization) {
  const actual = Buffer.from(String(authorization ?? ""));
  // timingSafeEqual requires equal lengths; checking the length first only reveals the length.
  return actual.length === EXPECTED.length && timingSafeEqual(actual, EXPECTED);
}
