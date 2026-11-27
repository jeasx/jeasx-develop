import isCrossSite from "./@helpers/isCrossSite";

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Requests which change state (forms, fetch calls) must come from this site,
  // so other sites can't forge them (CSRF). GET and HEAD always pass.
  if (isCrossSite(request)) {
    return new Response("Forms of this site can only be sent from this site.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Prepare "this" context
  this.request = request;
  this.reply = reply;
}
