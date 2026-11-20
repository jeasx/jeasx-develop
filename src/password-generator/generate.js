const SETS = {
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
  const chars = sets.map((set) => SETS[set][randomChar(SETS[set])]);
  while (chars.length < length) {
    chars.push(alphabet[randomChar(alphabet)]);
  }
  // Fisher-Yates shuffle, so the guaranteed characters don't sit at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function randomChar(alphabet) {
  const limit = Math.floor(256 / alphabet.length) * alphabet.length;
  const bytes = new Uint8Array(1);
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return bytes[0] % alphabet.length;
}

function randomIndex(max) {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % max;
}
