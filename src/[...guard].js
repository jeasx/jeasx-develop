/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  // A response handler receives the response before rendering.
  // JSX is streamed by default. A route (or a deeper guard) can set
  // `this.jsxStream = false` to render JSX to a string instead, e.g. if the
  // complete markup is needed. Any other payload is passed through unchanged.
  //
  // this.responseHandler = function (payload) {
  //   return this.jsxStream === false && isJsxNode(payload)
  //     ? jsxToString.call(this, payload)
  //     : payload;
  // };
}
