import { createServerStore } from "./store/server";

/**
 * Puts the server store into `this`, where the route and all components
 * (e.g. the async <Column>) find it.
 *
 * @this {import("./store/server").ServerContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files like index.css need no cookie.
  if (reply.file) {
    return;
  }
  this.store = createServerStore(request, reply);
}
