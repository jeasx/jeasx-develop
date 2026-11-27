import isCrossSite, { crossSiteResponse } from "./@helpers/crossSite";

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Requests which change state (forms, fetch calls) must come from this site, so other
  // sites can't forge them (CSRF). GET and HEAD always pass, see "./@helpers/crossSite.js".
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  // Prepare "this" context
  this.request = request;
  this.reply = reply;
}
