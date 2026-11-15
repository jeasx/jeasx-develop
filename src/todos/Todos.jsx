import { MAX_LABEL_LENGTH } from "./state";
import TrashIcon from "./trash.svg";

const FILTERS = [
  { value: undefined, label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

/**
 * @param {import("./state").State & { from?: string }} props
 */
export default function Todos({ todos, status, from }) {
  const completed = todos.filter((todo) => todo.status === "completed").length;
  const active = todos.length - completed;
  const counts = { undefined: todos.length, active, completed };
  const visible = todos.filter((todo) => !status || status === todo.status);
  const percent = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <div class="card" id="app" data-state={JSON.stringify({ todos, status })}>
      <div class="summary">
        <div>
          <strong>{active}</strong> {active === 1 ? "task" : "tasks"} left
        </div>
        <div class="percent">{percent}% done</div>
      </div>
      <div class="progress" style={`--percent: ${percent}%${from ? `; --from: ${from}` : ""}`} />
      <form method="post" class="new-todo">
        <input
          name="newTodo"
          placeholder="What needs to be done?"
          autofocus
          maxlength={MAX_LABEL_LENGTH}
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
  );
}
