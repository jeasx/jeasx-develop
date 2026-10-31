/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  // Streaming is enabled by default,
  // switch to string mode with this.jsxStream = false.
  this.jsxStream = true;
}
