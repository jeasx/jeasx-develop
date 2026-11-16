import Layout from "../Layout";
import Board from "./Board";

export default function () {
  return (
    <Layout
      title="Kanban board"
      description="The same async JSX components render a Kanban board on the server and in the browser."
      css="/kanban/index.css"
      script="/kanban/index.js"
    >
      <h1>Kanban board</h1>
      <p class="lead">
        A kanban board whose columns are async JSX components: rendered on the server first, and
        re-rendered in your browser after every change.
      </p>
      <p>
        Every column is built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> and loads its own
        tasks from <code>this.store</code>. On the server, the store reads a cookie; in the browser,
        it fetches the tasks from an API.
      </p>
      <p>
        Turn off JavaScript and the board still works: the buttons submit plain forms and the server
        renders the whole board. The note under each column shows where it was rendered.
      </p>
      <Board />
    </Layout>
  );
}
