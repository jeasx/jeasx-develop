import { NO_JS_COOKIE, PATH } from "./store";

/**
 * Turns the "no JavaScript" simulation on or off. It's a form, not a link, as it changes state.
 * The cookie is unsigned: anyone may turn off the JavaScript of their own page.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method === "POST") {
    if (request.cookies[NO_JS_COOKIE]) {
      reply.clearCookie(NO_JS_COOKIE, { path: PATH });
    } else {
      reply.setCookie(NO_JS_COOKIE, "1", { path: PATH });
    }
  }
  return reply.redirect("/showdown", 303);
}
