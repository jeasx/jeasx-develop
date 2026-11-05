import { randomBytes } from "node:crypto";

/**
 * Creates a nonce: a random value which is new for every response,
 * so injected markup can't know it in advance.
 */
export function createNonce() {
  return randomBytes(16).toString("base64");
}

/**
 * Builds a strict Content Security Policy around a nonce.
 *
 * - script-src: only scripts with the nonce run, no inline event handlers, no eval().
 *   'strict-dynamic' lets these scripts load further modules, so no list of hosts is needed.
 * - img-src: images from this site and data: URLs, which the stylesheet uses for icons (e.g. select arrows).
 * - object-src: no plugins.
 * - base-uri: an injected <base> can't redirect relative URLs to another host.
 * - form-action: forms can only be sent to this site.
 * - frame-ancestors: no other site can embed the page (against clickjacking).
 *
 * @param {string} nonce
 */
export function createPolicy(nonce) {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
