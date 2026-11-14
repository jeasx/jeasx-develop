import { CAPACITY, REFILL_PER_SECOND, take } from "../bucket";

/**
 * Rate-limits every route below "/rate-limit/api" per IP address.
 * A guard which returns a Response answers the request, so the route never runs.
 *
 * Behind a proxy, request.ip is only the client's address if Fastify trusts
 * the proxy (see "trustProxy" in jeasx.config.js).
 *
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const { allowed, remaining, reset, retryAfter } = take(request.ip);

  // Tell clients about their budget, so well-behaved ones can slow down in time.
  reply.header("ratelimit-policy", `${CAPACITY};w=${CAPACITY / REFILL_PER_SECOND}`);
  reply.header("ratelimit-limit", CAPACITY);
  reply.header("ratelimit-remaining", remaining);
  reply.header("ratelimit-reset", reset);

  if (!allowed) {
    // A Response (not a plain object, which a guard would hand to the route as props).
    return Response.json(
      { error: "Too many requests", retryAfter },
      { status: 429, headers: { "retry-after": String(retryAfter) } },
    );
  }
}
