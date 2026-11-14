import { COLUMNS } from "./columns";

/**
 * One task. The buttons are part of a plain form, so they work without JavaScript:
 * the server moves the task and redirects back to the board. With JavaScript,
 * "./index.jsx" sends the same form with fetch and only re-renders the changed columns.
 *
 * @param {{ task: { id: string, title: string, status: string } }} props
 */
export default function Card({ task }) {
  const index = COLUMNS.findIndex(({ status }) => status === task.status);
  const prev = COLUMNS[index - 1];
  const next = COLUMNS[index + 1];
  return (
    <li class="kanban-card" draggable="true" data-id={task.id}>
      <form method="post" action="/kanban/api">
        <input type="hidden" name="id" value={task.id} />
        <button
          name="to"
          value={prev?.status}
          disabled={!prev}
          aria-label={`Move to ${prev?.title}`}
        >
          ←
        </button>
        <span class="title">{task.title}</span>
        <button
          name="to"
          value={next?.status}
          disabled={!next}
          aria-label={`Move to ${next?.title}`}
        >
          →
        </button>
        <button name="remove" value="1" class="remove" aria-label={`Delete "${task.title}"`}>
          ×
        </button>
      </form>
    </li>
  );
}
