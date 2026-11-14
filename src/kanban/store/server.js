import { readListCookie, writeListCookie } from "../../@helpers/cookies";
import { STATUSES } from "../columns";

const PATH = "/kanban";
const MAX_TITLE_LENGTH = 80;
const MAX_TASKS = 30;

const DEFAULT_TASKS = [
  { id: "a1", title: "Write a JSX component", status: "done" },
  { id: "a2", title: "Render it on the server", status: "done" },
  { id: "a3", title: "Render it in the browser", status: "doing" },
  { id: "a4", title: "Turn off JavaScript and try again", status: "todo" },
  { id: "a5", title: "Drag a card to another column", status: "todo" },
];

/** @typedef {ReturnType<typeof createServerStore>} ServerStore */
/** @typedef {import("../../types").ThisContext & { store: ServerStore }} ServerContext */

/**
 * The store on the server: it keeps the tasks in a signed cookie. Components only see
 * `tasks(status)`, the same method the browser store offers (see "./browser.js").
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
export function createServerStore(request, reply) {
  let tasks = readListCookie(request, "kanban")?.map(toTask) ?? structuredClone(DEFAULT_TASKS);

  return {
    renderer: "server",

    /** @param {string} status */
    async tasks(status) {
      return tasks.filter((task) => task.status === status);
    },

    /**
     * Applies a form submission and returns the statuses of the columns which changed.
     * @param {Record<string, unknown>} body
     */
    apply(body) {
      const changed = new Set();
      const title = String(body["title"] ?? "")
        .trim()
        .slice(0, MAX_TITLE_LENGTH);
      if (title) {
        tasks.push({
          id: crypto.randomUUID().slice(0, 8),
          title,
          status: "todo",
        });
        tasks = tasks.slice(-MAX_TASKS);
        changed.add("todo");
      }
      const task = tasks.find(({ id }) => id === body["id"]);
      if (task && body["remove"]) {
        tasks = tasks.filter((other) => other !== task);
        changed.add(task.status);
      } else if (task && STATUSES.includes(String(body["to"]))) {
        changed.add(task.status).add(String(body["to"]));
        // Moved cards go to the end of their new column.
        tasks = [
          ...tasks.filter((other) => other !== task),
          { ...task, status: String(body["to"]) },
        ];
      }
      if (changed.size) {
        tasks = writeListCookie(reply, "kanban", tasks, PATH);
      }
      return [...changed];
    },
  };
}

/**
 * The cookie is signed, but could hold a signed value of another cookie,
 * so only accept known fields of limited length.
 *
 * @param {Record<string, unknown>} item
 */
function toTask({ id, title, status }) {
  return {
    id: String(id ?? "").slice(0, 36),
    title: String(title ?? "").slice(0, MAX_TITLE_LENGTH),
    status: STATUSES.includes(String(status)) ? String(status) : "todo",
  };
}
