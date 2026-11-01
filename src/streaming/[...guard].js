import { jsxToString } from "jsx-async-runtime";

/**
 * Userland switch for easing the migration from v2 to v3:
 * JSX is streamed by default in v3. A route can set `this.jsxStream = false`
 * to render JSX to a string instead, e.g. if the complete markup is needed.
 *
 * Put this into your root guard to restore the former behaviour for all routes.
 *
 * @this {import("../types").ThisContext & { jsxStream?: boolean }}
 */
export default function () {
  this.jsxToString = (jsxElement) => {
    return this.jsxStream === false ? jsxToString.call(this, jsxElement) : jsxElement;
  };
}
