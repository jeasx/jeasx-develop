/**
 * Tells whether a request that changes state (e.g. a form POST) comes from another site.
 *
 * SameSite cookies only stop the browser from *sending* cookies along with a cross-site
 * request. Its response could still *set* cookies, e.g. overwrite the todos of a visitor.
 * Examples which keep their state in cookies reject such requests with this check, without
 * needing a CSRF token (see the "signed-cookies" example for tokens).
 *
 * Modern browsers send "Sec-Fetch-Site"; older ones only send "Origin". Requests without
 * either (e.g. curl) don't come from a browser, so another site can't trigger them.
 *
 * @param {import("fastify").FastifyRequest} request
 */
export default function isCrossSite(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return false;
  }
  const site = request.headers["sec-fetch-site"];
  if (site) {
    // "same-site" includes other subdomains, which may be run by someone else.
    return site !== "same-origin" && site !== "none";
  }
  const origin = request.headers["origin"];
  if (!origin) {
    return false;
  }
  try {
    return new URL(origin).host !== request.headers["host"];
  } catch {
    // E.g. "null" for sandboxed frames.
    return true;
  }
}

/** The answer for a rejected cross-site request. */
export function crossSiteResponse() {
  return new Response("Forms of this example can only be sent from this site.", {
    status: 403,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
