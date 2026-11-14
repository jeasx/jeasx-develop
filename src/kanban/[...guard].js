import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { createServerStore } from "./store/server";

/**
 * Puts the server store into `this`, where the route and all components
 * (e.g. the async <Column>) find it.
 *
 * @this {import("./store/server").ServerContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Other sites must not change the board with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }
  this.store = createServerStore(request, reply);
}
