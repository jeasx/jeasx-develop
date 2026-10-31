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
  const body = request.body || {};

  let todos = readListCookie(request.cookies["todos"]) ?? structuredClone(DEFAULT_TODOS);

  if (body["newTodo"]) {
    todos.unshift({ label: String(body["newTodo"]).slice(0, MAX_LABEL_LENGTH), status: "active" });
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
    todos = writeListCookie(reply, "todos", todos);
  }

  return {
    todos,
    status: query["status"],
    autofocus: request.method === "GET" || Boolean(body["newTodo"]),
  };
}
