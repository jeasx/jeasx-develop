/**
 * GET returns the tasks of a column as JSON for the browser store.
 * POST applies a form: plain form submissions (without JavaScript) are redirected
 * back to the board, fetch requests from "./index.jsx" get the changed columns.
 *
 * @this {import("./store/server").ServerContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  if (request.method === "POST") {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const changed = this.store.apply(/** @type {Record<string, unknown>} */ (body));
    if (request.headers.accept?.includes("application/json")) {
      return { changed };
    }
    // 303 makes the browser load the board with GET, so a reload doesn't send the form again.
    return reply.redirect("/kanban", 303);
  }
  reply.header("cache-control", "no-store");
  return await this.store.tasks(String(request.query["status"] ?? ""));
}
