// Helpers for examples which store their state in a cookie instead of a database.
// The cookies are signed with the secret configured in jeasx.config.js, so values edited
// in the browser are ignored (see the "signed-cookies" example). The signature covers only
// the value, not the name: a signed value of another cookie would pass as well, so readers
// still check the type of what they parse.

/** Browsers silently drop cookies larger than about 4 KB (name, value and attributes). */
export const MAX_COOKIE_SIZE = 3800;

// Each example stores its cookies under its own path. With path "/", the browser would send
// the cookies of all examples with every request, and a few full ones exceed the 16 KB
// header limit of Node: then every request fails with "431 Request Header Fields Too Large".

/**
 * Checks if a value fits into a signed cookie once it is signed and encoded
 * like @fastify/cookie does.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {string} value
 */
export function fitsCookie(reply, value) {
  return encodeURIComponent(reply.signCookie(value)).length <= MAX_COOKIE_SIZE;
}

/**
 * Reads a cookie set with { signed: true }.
 * Returns status "missing" without cookie and "invalid" if the value doesn't match its
 * signature, e.g. because it was edited in the browser. Only a "valid" cookie has a value.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {string} name
 * @returns {{ status: "missing" | "invalid" | "valid", value?: string }}
 */
export function readSigned(request, name) {
  const cookie = request.cookies[name];
  if (cookie === undefined) {
    return { status: "missing" };
  }
  const { valid, value } = request.unsignCookie(cookie);
  return valid ? { status: "valid", value } : { status: "invalid" };
}

/**
 * Reads a signed cookie. Returns undefined if it is missing or was changed after signing.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {string} name
 */
export function readSignedCookie(request, name) {
  return readSigned(request, name).value;
}

/**
 * Reads a JSON list from a signed cookie. Only objects are kept.
 * Returns undefined if the cookie is missing, edited or isn't a list.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {string} name
 * @returns {Record<string, unknown>[] | undefined}
 */
export function readListCookie(request, name) {
  try {
    const list = JSON.parse(readSignedCookie(request, name));
    if (Array.isArray(list)) {
      return list.filter((item) => item && typeof item === "object");
    }
  } catch {}
  return undefined;
}

/**
 * Stores a list as JSON in a signed cookie, dropping items from the end until it fits.
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
  while (kept.length > 1 && !fitsCookie(reply, JSON.stringify(kept))) {
    kept.pop();
  }
  reply.setCookie(name, JSON.stringify(kept), { path, signed: true });
  return kept;
}
