import { SLUGS } from "./domain/constants";
import navigate from "./domain/navigate";
import validator from "./domain/validator";
import { compress, decompress } from "./utils/zip";

// Browsers silently drop cookies larger than about 4 KB (name, value and attributes),
// which would lose all answers.
const MAX_COOKIE_SIZE = 3800;

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const path = request.path;

  // Answers are stored per path, so "/wizard/4-claimant/" must not become a separate step.
  if (path.length > 1 && path.endsWith("/") && request.method === "GET") {
    return reply.redirect(path.replace(/\/+$/, ""), 301);
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
            hash: "No saved damage report was found for this token. Please check the token or start a new report.",
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

      const cookie = compress(props.data);
      tooLarge = cookie.length > MAX_COOKIE_SIZE;
      if (!tooLarge) {
        reply.setCookie("data", cookie);
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
        case "Save":
          return reply.redirect(SLUGS.SAVE);
        case "Back":
          // Steps outside of the current flow have no previous step.
          return reply.redirect(props.previous || SLUGS.START);
        default:
          props.errors = validator(path, props.data[path]);
          if (Object.keys(props.errors).length === 0) {
            return reply.redirect(props.next);
          }
      }
    }

    props.form = props.data[path] || {};
    return props;
  } catch (error) {
    console.error(error);
    reply.clearCookie("data");
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
  if (!/^ID-[0-9A-F]{8}$/.test(token)) {
    return;
  }
  try {
    const data = decompress(cookies[token]);
    return data && typeof data === "object" ? data : undefined;
  } catch {
    return;
  }
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
