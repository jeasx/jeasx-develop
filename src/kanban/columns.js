/** The columns of the board, in order. Shared by the server and the browser. */
export const COLUMNS = [
  { status: "todo", title: "Todo" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

export const STATUSES = COLUMNS.map(({ status }) => status);

/** @typedef {{ id: string, title: string, status: string }} Task */

/**
 * What components need from a store: the server and the browser store both offer it.
 * @typedef {{ renderer: string, tasks: (status: string) => Promise<Task[]> }} Store
 */

/** @typedef {{ store: Store }} StoreContext */
