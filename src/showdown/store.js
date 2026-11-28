// Every version keeps its list in a signed cookie per visitor and version, so it is rendered
// on the server and its form works without JavaScript.
import { readListCookie, writeListCookie } from "../@helpers/cookies";
import { INITIAL, MAX_ITEMS, MAX_LENGTH } from "./shopping";

/** The path of all cookies of this example. */
export const PATH = "/showdown";

/** The frameworks, each with its own cookie. */
export const FRAMEWORKS = /** @type {const} */ ([
  "jeasx",
  "htmx",
  "preact",
  "react",
  "vue",
  "svelte",
  "alpine",
  "lit",
]);

/** @typedef {typeof FRAMEWORKS[number]} Framework */

/** @param {Framework} framework */
const cookieName = (framework) => `showdown-${framework}`;

/**
 * Only valid items are kept, as the cookie could hold a signed value of another example.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {Framework} framework
 * @returns {import("./shopping").Item[]}
 */
export function loadItems(request, framework) {
  const stored = readListCookie(request, cookieName(framework));
  if (!stored) return INITIAL;
  return stored
    .filter((item) => Number.isInteger(item.id) && typeof item.text === "string")
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      id: Number(item.id),
      text: String(item.text).slice(0, MAX_LENGTH),
      done: item.done === true,
    }));
}

/**
 * @param {import("fastify").FastifyReply} reply
 * @param {Framework} framework
 * @param {import("./shopping").Item[]} items
 */
export function saveItems(reply, framework, items) {
  writeListCookie(reply, cookieName(framework), items, PATH);
}

/** Set while the page simulates a browser without JavaScript (see "./[nojs].js"). */
export const NO_JS_COOKIE = "showdown-nojs";
