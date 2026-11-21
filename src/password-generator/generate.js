export const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

/**
 * Generates cryptographically secure passwords with crypto.getRandomValues.
 * Rejection sampling avoids modulo bias, so every character is equally likely.
 * @param {{ length: number, sets: string[] }} options
 * @returns {string}
 */
export function generatePassword({ length, sets }) {
  const alphabet = sets.map((set) => SETS[set]).join("");
  // One guaranteed character from every enabled set, then fill up from the full alphabet.
  const chars = sets.map((set) => SETS[set][randomInt(SETS[set].length)]);
  while (chars.length < length) {
    chars.push(alphabet[randomInt(alphabet.length)]);
  }
  // Fisher-Yates shuffle, so the guaranteed characters don't sit at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Uniform random integer in [0, max) via rejection sampling (max <= 256). */
function randomInt(max) {
  const limit = Math.floor(256 / max) * max;
  const bytes = new Uint8Array(1);
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return bytes[0] % max;
}
