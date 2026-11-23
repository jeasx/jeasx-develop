/**
 * Returns the parsed body of a request as an object. A JSON body can also be a number,
 * a string or null, which form handlers can't read fields from: then the body is empty.
 *
 * @param {import("fastify").FastifyRequest} request
 * @returns {Record<string, unknown>}
 */
export default function formBody(request) {
  return request.body && typeof request.body === "object"
    ? /** @type {Record<string, unknown>} */ (request.body)
    : {};
}
