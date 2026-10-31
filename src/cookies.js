// Helpers for examples which store their state in a cookie instead of a database.

/** Browsers silently drop cookies larger than about 4 KB (name, value and attributes). */
export const MAX_COOKIE_SIZE = 3800;

// Each example stores its cookies under its own path. With path "/", the browser would send
// the cookies of all examples with every request, and a few full ones exceed the 16 KB
// header limit of Node: then every request fails with "431 Request Header Fields Too Large".

/**
 * Checks if a value fits into a cookie once it is encoded like @fastify/cookie does.
 *
 * @param {string} value
 */
export function fitsCookie(value) {
  return encodeURIComponent(value).length <= MAX_COOKIE_SIZE;
}

/**
 * Reads a JSON list from a cookie. The cookie can be edited by the client,
 * so only objects are kept. Returns undefined if it is missing or malformed.
 *
 * @param {string | undefined} cookie
 * @returns {Record<string, unknown>[] | undefined}
 */
export function readListCookie(cookie) {
  try {
    const list = JSON.parse(cookie);
    if (Array.isArray(list)) {
      return list.filter((item) => item && typeof item === "object");
    }
  } catch {}
  return undefined;
}

/**
 * Stores a list as JSON in a cookie, dropping items from the end until it fits.
 * The first item is always kept, so callers must make sure it fits on its own.
 * Returns the stored items.
 *
 * @template T
 * @param {import("fastify").FastifyReply} reply
 * @param {string} name
 * @param {T[]} list
 * @param {string} path Path of the example, so the cookie isn't sent to other examples.
 */
export function writeListCookie(reply, name, list, path) {
  const kept = [...list];
  while (kept.length > 1 && !fitsCookie(JSON.stringify(kept))) {
    kept.pop();
  }
  reply.setCookie(name, JSON.stringify(kept), { path });
  return kept;
}
