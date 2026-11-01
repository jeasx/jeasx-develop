/**
 * Reads a cookie set with { signed: true }.
 * Returns status "missing" without cookie and "invalid" if the value doesn't match its
 * signature, e.g. because it was edited in the browser. Only a "valid" cookie has a value.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {string} name
 * @returns {{ status: "missing" | "invalid" | "valid", value?: string }}
 */
export default function readSigned(request, name) {
  const cookie = request.cookies[name];
  if (cookie === undefined) {
    return { status: "missing" };
  }
  const { valid, value } = request.unsignCookie(cookie);
  return valid ? { status: "valid", value } : { status: "invalid" };
}
