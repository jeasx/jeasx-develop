import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { ERRORS, MAX_NAME_LENGTH, MAX_TEXT_LENGTH, PATH, postMessage } from "./room";

// Time of the last message per IP address, to slow down flooding.
/** @type {Map<string, number>} */
const lastPostByIp = new Map();
const MIN_INTERVAL = 1000;

/**
 * Receives a chat message. Works as a plain form post (answered with a redirect)
 * and with fetch() from the page's script (answered with JSON).
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  // Other sites must not post messages through a visitor's browser.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  const wantsJson = String(request.headers.accept).includes("application/json");
  const body = request.body && typeof request.body === "object" ? request.body : {};
  const name = clean(body["name"], MAX_NAME_LENGTH);
  const text = clean(body["text"], MAX_TEXT_LENGTH);

  /** @type {keyof typeof ERRORS | ""} */
  let error = "";
  if (!name || !text) {
    error = "missing";
  } else if (Date.now() - (lastPostByIp.get(request.ip) ?? 0) < MIN_INTERVAL) {
    error = "fast";
  }

  if (error) {
    // The redirect only carries the code: with the text in the URL, anyone could
    // link to the chat with a message of their own in the error line.
    return wantsJson
      ? Response.json({ error: ERRORS[error] }, { status: 400 })
      : redirect(`${PATH}?error=${error}`);
  }

  lastPostByIp.set(request.ip, Date.now());
  // Forget old entries, so the map doesn't grow forever.
  for (const [ip, time] of lastPostByIp) {
    if (Date.now() - time > MIN_INTERVAL) {
      lastPostByIp.delete(ip);
    }
  }

  postMessage(name, text);

  // Remember the name for the next visit.
  reply.setCookie("name", name, { path: PATH, maxAge: 365 * 24 * 60 * 60 });

  return wantsJson ? Response.json({ ok: true }) : redirect(PATH);
}

/**
 * Turns a form value into a single line of limited length.
 *
 * @param {unknown} value
 * @param {number} maxLength
 */
function clean(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** @param {string} location */
function redirect(location) {
  // 303 makes the browser load the page with GET, so a reload doesn't post again.
  return new Response(null, { status: 303, headers: { location } });
}
