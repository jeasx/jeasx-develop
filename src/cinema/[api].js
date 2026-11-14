/**
 * GET returns one part of the page as JSON for the browser store.
 * POST applies a form: plain form submissions (without JavaScript) are redirected
 * back to the page, fetch requests from "./index.jsx" get the parts which changed.
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
    // 303 makes the browser load the page with GET, so a reload doesn't send the form again.
    return reply.redirect("/cinema", 303);
  }
  reply.header("cache-control", "no-store");
  switch (request.query["part"]) {
    case "screening":
      return await this.store.screening();
    case "row":
      return await this.store.seats(String(request.query["row"] ?? ""));
    case "summary":
      return await this.store.selection();
    default:
      reply.status(404);
      return {};
  }
}
