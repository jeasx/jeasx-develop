// Helpers for avatars, used on the server and in the browser (see the "chat" example),
// so a name looks the same wherever it is rendered.

/**
 * Derives a stable hue (0-359) from a text, e.g. a color per author.
 *
 * @param {string} text
 */
export function hue(text) {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + /** @type {number} */ (char.codePointAt(0))) % 360;
  }
  return hash;
}

/**
 * Returns the first character of a name in uppercase. Unlike charAt(0), it keeps
 * characters made of two UTF-16 units (e.g. emojis) intact.
 *
 * @param {string} name
 */
export function initial(name) {
  return ([...name][0] ?? "").toUpperCase();
}
