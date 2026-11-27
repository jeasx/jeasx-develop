import formBody from "../@helpers/formBody";
import { readListCookie, writeListCookie } from "../@helpers/cookies";
import { DEFAULT_TODOS, reduce, toStatus, toTodo } from "./state";

const PATH = "/todos";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files like index.css need no cookie.
  if (reply.file) {
    return;
  }
  // Forms from other sites are rejected by the root guard (src/[...guard].js).

  const status = toStatus(request.query["status"]);
  const state = {
    todos: readListCookie(request, "todos")?.map(toTodo) ?? structuredClone(DEFAULT_TODOS),
    status,
  };

  // Only form submissions change todos.
  if (request.method === "POST") {
    const { todos } = reduce(state, formBody(request));
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

  // The page depends on the cookie, so caches must not hand it to other visitors.
  reply.header("cache-control", "private, no-store");
  return state;
}
