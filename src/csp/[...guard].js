import { createNonce, createPolicy } from "./policy";

/**
 * Runs before every route of this example: creates a nonce for this request, puts it into
 * the "this" context and sends a Content Security Policy which only allows scripts with it.
 * The Layout reads `this.nonce` and adds it to its script tags.
 *
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files run no inline scripts, so they need no nonce.
  if (reply.file) {
    return;
  }

  this.nonce = createNonce();

  // "?csp=off" leaves the policy out, so the page can show what it prevents.
  if (request.query["csp"] !== "off") {
    reply.header("content-security-policy", createPolicy(this.nonce));
  }

  // A cached page would repeat its nonce for every visitor, which makes it guessable.
  reply.header("cache-control", "no-store");
}
