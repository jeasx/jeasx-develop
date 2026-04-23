/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const query = request.query || {};
  const body = request.body || {};

  const todos = request.cookies["todos"]
    ? JSON.parse(request.cookies["todos"])
    : [
        { label: "Buy some apples", status: "active" },
        { label: "Learn to code", status: "completed" },
        { label: "Talk to a friend", status: "active" },
      ];

  if (body["newTodo"]) {
    todos.unshift({ label: body["newTodo"], status: "active" });
  }

  if (body["toogleTodo"]) {
    const todo = todos[+body["toogleTodo"]];
    todo.status = todo.status === "active" ? "completed" : "active";
  }

  if (body["removeTodo"]) {
    todos.splice(+body["removeTodo"], 1);
  }

  reply.setCookie("todos", JSON.stringify(todos));

  return {
    todos,
    status: query["status"],
    autofocus: request.method === "GET" || body["newTodo"],
  };
}
