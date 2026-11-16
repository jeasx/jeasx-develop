import Layout from "../Layout";
import Todos from "./Todos";

/**
 * @param {import("./state").State} props
 */
export default function ({ todos, status }) {
  return (
    <Layout
      title="Todos"
      description="A todo app rendered on the server, then the same JSX component runs in the browser."
      css="/todos/index.css"
      script="/todos/index.js"
    >
      <div class="todos">
        <h1>Todos</h1>
        <p class="lead">
          A todo list rendered by the same reducer and JSX component on the server and in the
          browser, which works with and without JavaScript.
        </p>
        <p>
          The server renders the first page. After that, the browser handles adding, completing and
          deleting todos and sends the form in the background, so the server can store your todos in
          a cookie. Without JavaScript, every click submits a plain HTML form and the server renders
          the updated list.
        </p>
        <Todos todos={todos} status={status} />
      </div>
    </Layout>
  );
}
