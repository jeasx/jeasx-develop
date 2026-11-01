import { PATH, endSession } from "./session";

/**
 * Signs out with POST only: a GET link could be triggered by other sites or by prefetching.
 * The guard has already checked the CSRF token.
 *
 * @param {import("../types").RouteProps & {
 *   session?: ReturnType<typeof import("./store").getSession>
 * }} props
 */
export default function ({ request, reply, session }) {
  if (request.method === "POST") {
    endSession(reply, session?.id);
  }
  return reply.redirect(PATH, 303);
}
