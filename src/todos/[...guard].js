import { readListCookie, writeListCookie } from "../cookies";

const MAX_LABEL_LENGTH = 200;

const DEFAULT_TODOS = [
  { label: "Buy some apples", status: "active" },
  { label: "Learn to code", status: "completed" },
  { label: "Talk to a friend", status: "active" },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const query = request.query || {};
  // A JSON body can also be a number or string, which the "in" check below can't handle.
  const body = /** @type {Record<string, unknown>} */ (
    request.body && typeof request.body === "object" ? request.body : {}
  );

  let todos =
    readListCookie(request.cookies["todos"])?.map(toTodo) ?? structuredClone(DEFAULT_TODOS);

  // Ignore todos without any text, e.g. only spaces.
  const newTodo = String(body["newTodo"] ?? "")
    .trim()
    .slice(0, MAX_LABEL_LENGTH);
  if (newTodo) {
    todos.unshift({ label: newTodo, status: "active" });
  }

  if (body["toggleTodo"]) {
    const todo = todos[Number(body["toggleTodo"])];
    if (todo) {
      todo.status = todo.status === "active" ? "completed" : "active";
    }
  }

  if (body["removeTodo"]) {
    const index = Number(body["removeTodo"]);
    if (Number.isInteger(index) && index >= 0) {
      todos.splice(index, 1);
    }
  }

  // Only form submissions change todos. The guard also runs for static files
  // like index.css, which shouldn't carry a cookie.
  if (request.method === "POST") {
    // Drop the oldest todos until the cookie fits.
    todos = writeListCookie(reply, "todos", todos, "/todos");
  }

  return {
    todos,
    status: query["status"],
    autofocus: request.method === "GET" || "newTodo" in body,
  };
}

/**
 * The cookie can be edited by the client, so turn the label into a string of limited length
 * and only allow known states.
 *
 * @param {Record<string, unknown>} item
 */
function toTodo({ label, status }) {
  return {
    label: String(label ?? "").slice(0, MAX_LABEL_LENGTH),
    status: status === "completed" ? "completed" : "active",
  };
}
