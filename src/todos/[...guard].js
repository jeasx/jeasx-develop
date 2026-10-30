// Browsers silently drop cookies larger than about 4 KB (name, value and attributes).
const MAX_COOKIE_SIZE = 3800;
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

  const todos = readTodos(request.cookies["todos"]);

  if (body["newTodo"]) {
    todos.unshift({ label: String(body["newTodo"]).slice(0, MAX_LABEL_LENGTH), status: "active" });
  }

  if (body["toogleTodo"]) {
    const todo = todos[Number(body["toogleTodo"])];
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

  // Drop the oldest todos until the cookie fits.
  while (todos.length > 1 && encodeURIComponent(JSON.stringify(todos)).length > MAX_COOKIE_SIZE) {
    todos.pop();
  }
  reply.setCookie("todos", JSON.stringify(todos));

  return {
    todos,
    status: query["status"],
    autofocus: request.method === "GET" || body["newTodo"],
  };
}

/**
 * Reads todos from the cookie; falls back to the defaults if it is missing or malformed.
 *
 * @param {string | undefined} cookie
 */
function readTodos(cookie) {
  try {
    const todos = JSON.parse(cookie);
    if (Array.isArray(todos)) {
      return todos.filter((todo) => todo && typeof todo === "object");
    }
  } catch {}
  return structuredClone(DEFAULT_TODOS);
}
