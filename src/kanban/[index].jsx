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
      <p>
        Every column is an <strong>async</strong> component built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> which loads its
        own tasks from <code>this.store</code>. The server renders the first page with a store that
        reads a cookie. After a change, the browser renders the changed columns with the same
        components and a store that fetches the tasks from an API.
      </p>
      <p>
        Turn off JavaScript and the board still works: the buttons submit plain forms and the server
        renders the whole board. The note under each column shows where it was rendered.
      </p>
      <Board />
    </Layout>
  );
}
