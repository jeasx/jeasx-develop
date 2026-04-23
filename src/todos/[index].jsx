import Layout from "../Layout";

export default function ({ todos, status, autofocus }) {
  return (
    <Layout title="Todo app with Jeasx" description="A simple todo app in Jeasx." css="./index.css">
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
                  class={{
                    toggle: true,
                    checked: todo.status === "completed",
                  }}
                  name="toogleTodo"
                  value={todos.indexOf(todo)}
                >
                  [{todo.status}]
                </button>
                <label>{todo.label}</label>
                <button class="destroy" name="removeTodo" value={todos.indexOf(todo)}>
                  <img src="/icons/trash.svg" alt="Delete" />
                </button>
              </li>
            ))}
        </ul>
      </form>
      <ul class="filters">
        <li>
          <a href="" class={{ selected: !status }}>
            all
          </a>
        </li>
        {["active", "completed"].map((value) => (
          <li>
            <a href={`?status=${value}`} class={{ selected: status === value }}>
              {value}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
