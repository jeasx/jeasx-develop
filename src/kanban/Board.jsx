import Column from "./Column";
import { COLUMNS } from "./columns";

/** All columns render in parallel, each one waiting for its own tasks. */
export default function Board() {
  return (
    <div class="kanban-board">
      {COLUMNS.map(({ status }) => (
        <Column status={status} />
      ))}
    </div>
  );
}
