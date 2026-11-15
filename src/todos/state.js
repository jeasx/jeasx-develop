// The state and its changes, shared by the server and the browser.

/** @typedef {{ label: string, status: "active" | "completed" }} Todo */
/** @typedef {{ todos: Todo[], status?: "active" | "completed" }} State */

export const MAX_LABEL_LENGTH = 200;

/** @type {Todo[]} */
export const DEFAULT_TODOS = [
  { label: "Buy some apples", status: "active" },
  { label: "Learn to code", status: "completed" },
  { label: "Talk to a friend", status: "active" },
];

/**
 * Applies a submitted form to the state.
 *
 * @param {State} state
 * @param {Record<string, unknown>} input
 * @returns {State}
 */
export function reduce(state, input) {
  let todos = state.todos.map((todo) => ({ ...todo }));

  // Ignore todos without any text, e.g. only spaces.
  const newTodo = String(input["newTodo"] ?? "")
    .trim()
    .slice(0, MAX_LABEL_LENGTH);
  if (newTodo) {
    todos.unshift({ label: newTodo, status: "active" });
  }

  if (input["toggleTodo"]) {
    const todo = todos[Number(input["toggleTodo"])];
    if (todo) {
      todo.status = todo.status === "active" ? "completed" : "active";
    }
  }

  if (input["removeTodo"]) {
    const index = Number(input["removeTodo"]);
    if (Number.isInteger(index) && index >= 0) {
      todos.splice(index, 1);
    }
  }

  if (input["clearCompleted"]) {
    todos = todos.filter((todo) => todo.status !== "completed");
  }

  return { ...state, todos };
}

/**
 * Picks the filter from a link like "?status=active".
 *
 * @param {State} state
 * @param {URL} url
 * @returns {State}
 */
export function navigate(state, url) {
  return { ...state, status: toStatus(url.searchParams.get("status")) };
}

/**
 * Unknown filters show all todos instead of an empty list.
 *
 * @param {unknown} value
 * @returns {State["status"]}
 */
export function toStatus(value) {
  return value === "active" || value === "completed" ? value : undefined;
}

/**
 * The cookie is signed, but could hold a signed value of another cookie,
 * so turn the label into a string of limited length and only allow known states.
 *
 * @param {Record<string, unknown>} item
 * @returns {Todo}
 */
export function toTodo({ label, status }) {
  return {
    label: String(label ?? "").slice(0, MAX_LABEL_LENGTH),
    status: status === "completed" ? "completed" : "active",
  };
}
