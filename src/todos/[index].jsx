import Layout from "../Layout";
import TrashIcon from "./trash.svg";

const FILTERS = [
  { value: undefined, label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function ({ todos, status }) {
  const completed = todos.filter((todo) => todo.status === "completed").length;
  const active = todos.length - completed;
  const counts = { undefined: todos.length, active, completed };
  const visible = todos.filter((todo) => !status || status === todo.status);
  const percent = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <Layout
      title="Todos"
      description="A todo app built with plain HTML forms that stores its state in a cookie."
      css="/todos/index.css"
    >
      <div class="todos">
        <h1>Todos</h1>
        <p class="lead">
          A classic todo app without client-side JavaScript: adding, completing and deleting a todo
          submits a plain HTML form, and the server renders the updated list. Your todos are stored
          in a cookie in your browser.
        </p>
        <div class="card" id="app">
          <div class="summary">
            <div>
              <strong>{active}</strong> {active === 1 ? "task" : "tasks"} left
            </div>
            <div class="percent">{percent}% done</div>
          </div>
          <div class="progress" style={`--percent: ${percent}%`} />
          <form method="post" class="new-todo">
            <input
              name="newTodo"
              placeholder="What needs to be done?"
              autofocus="autofocus"
              maxlength="200"
              autocomplete="off"
            />
            <button type="submit" aria-label="Add todo">
              +
            </button>
          </form>
          <nav class="filters">
            {FILTERS.map(({ value, label }) => (
              <a href={value ? `?status=${value}` : "?"} class={status === value ? "selected" : ""}>
                {label} <span class="count">{counts[value]}</span>
              </a>
            ))}
          </nav>
          <form method="post">
            {visible.length === 0 ? (
              <div class="empty">
                <span class="empty-icon">{status === "active" && todos.length ? "🎉" : "📝"}</span>
                {status === "active" && todos.length
                  ? "All done. Time for a break!"
                  : "Nothing here yet."}
              </div>
            ) : (
              <ul class="todo-list">
                {visible.map((todo) => (
                  <li class={todo.status}>
                    <button
                      class="toggle"
                      name="toggleTodo"
                      value={todos.indexOf(todo)}
                      aria-label={`Mark "${todo.label}" as ${
                        todo.status === "active" ? "completed" : "active"
                      }`}
                    />
                    <label>{todo.label}</label>
                    <button class="destroy" name="removeTodo" value={todos.indexOf(todo)}>
                      <img src={TrashIcon} alt={`Delete "${todo.label}"`} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {completed > 0 && (
              <div class="footer">
                <button class="clear" name="clearCompleted" value="1">
                  Clear completed ({completed})
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
