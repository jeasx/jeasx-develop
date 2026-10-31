import Layout from "../Layout";
import TrashIcon from "./trash.svg";

export default function ({ todos, status, autofocus }) {
  return (
    <Layout
      title="Todo app with Jeasx"
      description="A todo app built with plain HTML forms that stores its state in a cookie."
      css="/todos/index.css"
    >
      <h1>Todos</h1>
      <form method="post">
        <input name="newTodo" placeholder="What needs to be done?" autofocus={autofocus} />
      </form>
      <form method="post">
        <ul class="todo-list">
          {todos
            .filter((todo) => !status || status === todo.status)
            .map((todo) => (
              <li class={todo.status}>
                <button
                  class={`toggle${todo.status === "completed" ? " checked" : ""}`}
                  name="toggleTodo"
                  value={todos.indexOf(todo)}
                >
                  [{todo.status}]
                </button>
                <label>{todo.label}</label>
                <button class="destroy" name="removeTodo" value={todos.indexOf(todo)}>
                  <img src={TrashIcon} alt="Delete" />
                </button>
              </li>
            ))}
        </ul>
      </form>
      <ul class="filters">
        <li>
          <a href="" class={!status ? "selected" : ""}>
            all
          </a>
        </li>
        {["active", "completed"].map((value) => (
          <li>
            <a href={`?status=${value}`} class={status === value ? "selected" : ""}>
              {value}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
