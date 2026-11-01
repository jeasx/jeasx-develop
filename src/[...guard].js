// import { jsxToString } from "jsx-async-runtime";

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  //
  // Userland switch for easing the migration from v2 to v3:
  // JSX is streamed by default in v3. A route can set `this.jsxStream = false`
  // to render JSX to a string instead, e.g. if the complete markup is needed.
  //
  // this.jsxToString = (jsxElement) => {
  //   return this.jsxStream === false ? jsxToString.call(this, jsxElement) : jsxElement;
  // };
}
