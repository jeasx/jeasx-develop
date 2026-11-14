import Card from "./Card";
import { COLUMNS } from "./columns";

/**
 * An async component: it loads its own tasks from `this.store`. On the server, the store
 * reads a cookie; in the browser, it fetches the API. The component is the same.
 *
 * @this {import("./columns").StoreContext}
 * @param {{ status: string }} props
 */
export default async function Column({ status }) {
  const { title } = COLUMNS.find((column) => column.status === status);
  const tasks = await this.store.tasks(status);
  return (
    <section class={`kanban-column ${this.store.renderer}`} data-status={status}>
      <header>
        <h2>{title}</h2>
        <span class="count">{tasks.length}</span>
      </header>
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <Card task={task} />
          ))}
        </ul>
      ) : (
        <p class="empty">Nothing here.</p>
      )}
      {status === "todo" && (
        <form method="post" action="/kanban/api" class="add">
          <input name="title" placeholder="New task" maxlength="80" required autocomplete="off" />
          <button type="submit">Add</button>
        </form>
      )}
      <small class="rendered">
        rendered in the {this.store.renderer} at {new Date().toLocaleTimeString("en-GB")}
      </small>
    </section>
  );
}
