import { readListCookie, writeListCookie } from "../@helpers/cookies";
import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { DEFAULT_TODOS, reduce, toStatus, toTodo } from "./state";

const PATH = "/todos";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Other sites must not overwrite the todos cookie with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  const status = toStatus(request.query["status"]);
  const state = {
    todos: readListCookie(request, "todos")?.map(toTodo) ?? structuredClone(DEFAULT_TODOS),
    status,
  };

  // Only form submissions change todos. The guard also runs for static files
  // like index.css, which shouldn't carry a cookie.
  if (request.method === "POST") {
    // A JSON body can also be a number or string, which the reducer can't handle.
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const { todos } = reduce(state, /** @type {Record<string, unknown>} */ (body));
    // Drop the oldest todos until the cookie fits.
    writeListCookie(reply, "todos", todos, PATH);
    // The browser already rendered the change itself, it only needs the cookie.
    if (request.headers.accept?.includes("application/json")) {
      return reply.status(204).send();
    }
    // 303 makes the browser load the list with GET, so a reload doesn't send the form again:
    // todos are removed by position, so a repeated removal would delete another todo.
    return reply.redirect(status ? `${PATH}?status=${status}` : PATH, 303);
  }

  return state;
}
