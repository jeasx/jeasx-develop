import { NO_JS_COOKIE } from "./store";

/**
 * Turns the "no JavaScript" simulation on or off. It's a form, not a link, as it changes state.
 * The cookie is unsigned: anyone may turn off the JavaScript of their own page.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method === "POST") {
    if (request.cookies[NO_JS_COOKIE]) {
      reply.clearCookie(NO_JS_COOKIE, { path: "/four-ways" });
    } else {
      reply.setCookie(NO_JS_COOKIE, "1", { path: "/four-ways" });
    }
  }
  return reply.redirect("/four-ways", 303);
}
