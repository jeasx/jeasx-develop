// The versions which keep their list in the browser save it in the session storage, so a
// reload keeps the changes like the cookie of the server-side versions. One key per version.

/**
 * @param {string} way
 * @returns {import("./shopping").Item[] | undefined}
 */
export function loadSession(way) {
  try {
    const items = JSON.parse(sessionStorage.getItem(`showdown-${way}`) ?? "null");
    return Array.isArray(items) ? items : undefined;
  } catch {
    return undefined;
  }
}

/**
 * @param {string} way
 * @param {import("./shopping").Item[]} items
 */
export function saveSession(way, items) {
  sessionStorage.setItem(`showdown-${way}`, JSON.stringify(items));
}
