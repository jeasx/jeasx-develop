import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { createHash } from "node:crypto";
import { fitsCookie, readSignedCookie } from "../@helpers/cookies";
import { SLUGS, TOKEN_PATTERN } from "./domain/constants";
import navigate from "./domain/navigate";
import validator from "./domain/validator";
import { compress, decompress } from "./utils/zip";

// Cookies are only sent to the wizard, see "../@helpers/cookies.js".
// Clearing a cookie needs the same path as setting it.
const COOKIE_OPTIONS = { path: "/wizard" };

// Only pages of the wizard store answers, so posts to other paths (e.g. "/wizard/foo") don't fill the cookie.
const STEPS = new Set(Object.values(SLUGS));

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files (e.g. "/wizard/index.js") need no answers, so serve them as they are.
  // Otherwise a broken cookie would redirect them to the start page below.
  if (reply.file) {
    return;
  }

  // Other sites must not overwrite the answers with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  const path = request.path;

  // A JSON body can also be a number or string, whose characters would be stored as answers.
  const body = /** @type {Record<string, unknown> | undefined} */ (
    request.body && typeof request.body === "object" ? request.body : undefined
  );

  // Answers are stored per path, so "/wizard/4-claimant/" must not become a separate step.
  if (path.length > 1 && path.endsWith("/") && request.method === "GET") {
    // The path is decoded, so encode it again: characters like "✓" or a line break
    // aren't allowed in the Location header. "?" and "#" would end the path, so encode them too.
    const location = encodeURI(path.replace(/\/+$/, "")).replace(/[?#]/g, encodeURIComponent);
    const index = request.url.indexOf("?");
    return reply.redirect(location + (index === -1 ? "" : request.url.slice(index)), 301);
  }

  // Other methods aren't redirected (a redirect would drop the form data),
  // so a post to "/wizard/4-claimant/" counts for "/wizard/4-claimant".
  const step = path.replace(/\/+$/, "");

  try {
    const props = {
      data: toAnswers(decompress(readSignedCookie(request, "data"))) || {},
      errors: {},
      previous: "",
      next: "",
      form: {},
    };

    let tooLarge = false;

    // Apply loaded and submitted data first, so navigation reflects the latest answers.
    if (body) {
      const token = String(body["$hash"] ?? "")
        .trim()
        .toUpperCase();
      if (token) {
        const saved = loadSaved(request, token);
        if (!saved) {
          // Keep the current answers instead of starting over with nothing.
          props.errors = {
            hash: "No saved claim was found for this token. Please check the token or start a new claim.",
          };
          props.form = { $hash: token };
          return props;
        }
        props.data = saved;
      }

      if (STEPS.has(step)) {
        const data = convertBodyToData(body);
        if (Object.keys(data).length > 0) {
          props.data[step] = data;
        } else {
          delete props.data[step];
        }
      }

      // A cookie which doesn't fit would be dropped by the browser and lose all answers.
      // The check includes the encoding of "+", "/" and "=" in the base64 value.
      const cookie = compress(props.data);
      tooLarge = !fitsCookie(reply, cookie);
      if (!tooLarge) {
        reply.setCookie("data", cookie, { ...COOKIE_OPTIONS, signed: true });
      }
    }

    const { previous, next } = navigate(step, props.data);
    props.previous = previous;
    props.next = next;

    if (tooLarge) {
      // Stay on the page and keep the submitted answers, so they can be shortened.
      props.errors = { size: "Your answers are too long to be stored. Please shorten them." };
    } else if (body) {
      switch (body["$action"] || "") {
        case "":
          break;
        // Saving and finishing delete the current answers. This only happens on form submissions,
        // so a plain GET (e.g. a link prefetch or a reload) never loses any answers.
        case "Save":
          return reply.redirect(`${SLUGS.SAVE}?token=${save(request, reply, props.data)}`);
        case "Back":
          // Steps outside of the current flow have no previous step.
          return reply.redirect(props.previous || SLUGS.START);
        default:
          props.errors = validator(step, props.data[step]);
          if (Object.keys(props.errors).length === 0) {
            if (props.next === SLUGS.THANK_YOU) {
              // The claim is complete, so its answers aren't needed anymore.
              reply.clearCookie("data", COOKIE_OPTIONS);
            }
            return reply.redirect(props.next);
          }
      }
    }

    props.form = props.data[step] || {};
    return props;
  } catch (error) {
    request.log.error(error);
    reply.clearCookie("data", COOKIE_OPTIONS);
    return reply.redirect(SLUGS.START);
  }
}

/**
 * Returns the saved answers for a token like "ID-1A2B3C4D",
 * or undefined if the token is invalid, unknown, expired or its cookie is edited or broken.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {string} token
 */
function loadSaved(request, token) {
  if (!TOKEN_PATTERN.test(token)) {
    return;
  }
  try {
    return toAnswers(decompress(readSignedCookie(request, token)));
  } catch {
    return;
  }
}

/**
 * Returns the value if it can hold answers, otherwise undefined.
 * The cookies are signed, but could hold a signed value of another cookie (see "../@helpers/cookies.js").
 * Arrays are rejected too: answers stored on them by path would be lost in JSON.stringify().
 *
 * @param {unknown} value
 * @returns {Record<string, any> | undefined}
 */
function toAnswers(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? /** @type {Record<string, any>} */ (value)
    : undefined;
}

/**
 * Saves the answers in a cookie of their own and returns its token.
 * The current answers are cleared, so the next claim starts empty.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 * @param {unknown} data
 */
function save(request, reply, data) {
  // The token is short and derived from the answers, so it can be guessed.
  // This is only safe because it's per-client: it is looked up in the visitor's own cookies.
  // Don't reuse it as a key in server-side storage; use crypto.randomUUID() there.
  const token =
    "ID-" + createHash("sha1").update(JSON.stringify(data)).digest("hex").slice(0, 8).toUpperCase();
  // Keep only the latest saved claim. Each one takes up to 4 KB, so piling them up
  // would push the Cookie header beyond the server's limit and every request would fail.
  for (const name of Object.keys(request.cookies)) {
    if (name !== token && TOKEN_PATTERN.test(name)) {
      reply.clearCookie(name, COOKIE_OPTIONS);
    }
  }
  // Keep the saved claim for 24h, as promised on the start page.
  reply.setCookie(token, compress(data), {
    ...COOKIE_OPTIONS,
    signed: true,
    maxAge: 24 * 60 * 60,
  });
  // Replaces the "data" cookie set above for the submitted answers.
  reply.clearCookie("data", COOKIE_OPTIONS);
  return token;
}

/**
 * Keeps the answers of a form: fields starting with "$" are controls (e.g. "$action").
 * Only text and lists of text are kept, so a posted file (a Buffer) or JSON object
 * doesn't end up in the cookie.
 *
 * @param {Record<string, unknown>} body
 */
function convertBodyToData(body) {
  /** @type {Record<string, string | string[]>} */
  const data = {};
  for (const [key, value] of Object.entries(body)) {
    if (key.startsWith("$")) {
      continue;
    }
    if (typeof value === "string") {
      data[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      data[key] = value;
    }
  }
  return data;
}
