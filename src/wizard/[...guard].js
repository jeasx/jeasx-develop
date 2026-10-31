import { createHash } from "node:crypto";
import { fitsCookie } from "../cookies";
import { SLUGS, TOKEN_PATTERN } from "./domain/constants";
import navigate from "./domain/navigate";
import validator from "./domain/validator";
import { compress, decompress } from "./utils/zip";

// Cookies are only sent to the wizard, see "../cookies.js".
// Clearing a cookie needs the same path as setting it.
const COOKIE_OPTIONS = { path: "/wizard" };

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const path = request.path;

  // Answers are stored per path, so "/wizard/4-claimant/" must not become a separate step.
  if (path.length > 1 && path.endsWith("/") && request.method === "GET") {
    // The path is decoded, so encode it again: characters like "✓" or a line break
    // aren't allowed in the Location header. "?" and "#" would end the path, so encode them too.
    const location = encodeURI(path.replace(/\/+$/, "")).replace(/[?#]/g, encodeURIComponent);
    const index = request.url.indexOf("?");
    return reply.redirect(location + (index === -1 ? "" : request.url.slice(index)), 301);
  }

  try {
    const props = {
      data: decompress(request.cookies["data"]) || {},
      errors: {},
      previous: "",
      next: "",
      form: {},
    };

    let tooLarge = false;

    // Apply loaded and submitted data first, so navigation reflects the latest answers.
    if (request.body) {
      const token = String(request.body["$hash"] ?? "")
        .trim()
        .toUpperCase();
      if (token) {
        const saved = loadSaved(request.cookies, token);
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

      const data = convertBodyToData(request.body);
      if (Object.keys(data).length > 0) {
        props.data[path] = data;
      } else {
        delete props.data[path];
      }

      // A cookie which doesn't fit would be dropped by the browser and lose all answers.
      // The check includes the encoding of "+", "/" and "=" in the base64 value.
      const cookie = compress(props.data);
      tooLarge = !fitsCookie(cookie);
      if (!tooLarge) {
        reply.setCookie("data", cookie, COOKIE_OPTIONS);
      }
    }

    const { previous, next } = navigate(path, props.data);
    props.previous = previous;
    props.next = next;

    if (tooLarge) {
      // Stay on the page and keep the submitted answers, so they can be shortened.
      props.errors = { size: "Your answers are too long to be stored. Please shorten them." };
    } else if (request.body) {
      switch (request.body["$action"] || "") {
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
          props.errors = validator(path, props.data[path]);
          if (Object.keys(props.errors).length === 0) {
            if (props.next === SLUGS.THANK_YOU) {
              // The claim is complete, so its answers aren't needed anymore.
              reply.clearCookie("data", COOKIE_OPTIONS);
            }
            return reply.redirect(props.next);
          }
      }
    }

    props.form = props.data[path] || {};
    return props;
  } catch (error) {
    console.error(error);
    reply.clearCookie("data", COOKIE_OPTIONS);
    return reply.redirect(SLUGS.START);
  }
}

/**
 * Returns the saved answers for a token like "ID-1A2B3C4D",
 * or undefined if the token is invalid, unknown, expired or its cookie is broken.
 *
 * @param {Record<string, string | undefined>} cookies
 * @param {string} token
 */
function loadSaved(cookies, token) {
  if (!TOKEN_PATTERN.test(token)) {
    return;
  }
  try {
    const data = decompress(cookies[token]);
    return data && typeof data === "object" ? data : undefined;
  } catch {
    return;
  }
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
  const token =
    "ID-" + createHash("sha1").update(JSON.stringify(data)).digest("hex").slice(0, 8).toUpperCase();
  // Keep only the latest saved claim. Each one takes up to 4 KB, so piling them up
  // would push the Cookie header beyond the server's limit and every request would fail.
  for (const name of Object.keys(request.cookies)) {
    if (name !== token && TOKEN_PATTERN.test(name)) {
      reply.clearCookie(name, COOKIE_OPTIONS);
    }
  }
  // Keep the saved claim for 10 days, as promised on the start page.
  reply.setCookie(token, compress(data), { ...COOKIE_OPTIONS, maxAge: 10 * 24 * 60 * 60 });
  // Replaces the "data" cookie set above for the submitted answers.
  reply.clearCookie("data", COOKIE_OPTIONS);
  return token;
}

function convertBodyToData(body) {
  const map = new Map();
  Object.keys(body)
    .filter((key) => !key.startsWith("$"))
    .forEach((key) => {
      map.set(key, body[key]);
    });
  return Object.fromEntries(map.entries());
}
