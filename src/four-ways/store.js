// Jeasx and HTMX keep the list on the server, in a signed cookie per visitor and version.
import { readListCookie, writeListCookie } from "../@helpers/cookies";
import { INITIAL, MAX_ITEMS, MAX_LENGTH } from "./shopping";

const PATH = "/four-ways";

/** @param {"jeasx" | "htmx"} way */
const cookieName = (way) => `four-ways-${way}`;

/**
 * Only valid items are kept, as the cookie could hold a signed value of another example.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {"jeasx" | "htmx"} way
 * @returns {import("./shopping").Item[]}
 */
export function loadItems(request, way) {
  const stored = readListCookie(request, cookieName(way));
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
 * @param {"jeasx" | "htmx"} way
 * @param {import("./shopping").Item[]} items
 */
export function saveItems(reply, way, items) {
  writeListCookie(reply, cookieName(way), items, PATH);
}

/** Set while the page simulates a browser without JavaScript (see "./[nojs].js"). */
export const NO_JS_COOKIE = "four-ways-nojs";
