import { fitsCookie, readListCookie, writeListCookie } from "../cookies";
import data from "./data.json";

/** Fields of a post and their maximum length. */
export const FIELDS = { slug: 100, title: 100, author: 100, description: 200, body: 1000 };
/** Fields which must not be empty. Without a slug, it is created from the title. */
export const REQUIRED_FIELDS = ["title", "author", "description", "body"];
// Slugs end up in links, so only allow safe characters (no "javascript:" etc.).
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// "/blog/post" is the form for new posts, so posts with these slugs could never be opened.
const RESERVED_SLUGS = new Set(["post"]);

/** @typedef {{ slug: string, title: string, author: string, description: string, body: string, date: string }} Post */

/**
 * Reads posts from the cookie; falls back to the example posts if it is missing or malformed.
 *
 * @param {import("fastify").FastifyRequest} request
 * @returns {Post[]}
 */
export function readPosts(request) {
  // The cookie can be edited by the client, so turn all fields into strings
  // and drop posts with invalid slugs.
  // Return a copy of the example data, so callers can add posts without changing it.
  return (
    readListCookie(request.cookies["posts"])
      ?.map(toPost)
      .filter((post) => SLUG_PATTERN.test(post.slug)) ?? [...data]
  );
}

/**
 * @param {Record<string, unknown>} item
 * @returns {Post}
 */
function toPost({ slug, title, author, description, body, date }) {
  const text = (/** @type {unknown} */ value) => String(value ?? "");
  return {
    slug: text(slug),
    title: text(title),
    author: text(author),
    description: text(description),
    body: text(body),
    date: text(date),
  };
}

/**
 * Checks if a post fits into the cookie on its own. Even within the field limits it may not,
 * as characters like "ü" or emojis grow to 6 or 12 characters once URL-encoded.
 *
 * @param {object} post
 */
export function canStore(post) {
  return fitsCookie(JSON.stringify([post]));
}

/**
 * Stores posts in the cookie, dropping the oldest ones until it fits.
 * The newest post must pass canStore(), otherwise the browser drops the cookie.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {Post[]} posts
 */
export function writePosts(reply, posts) {
  writeListCookie(reply, "posts", posts, "/blog");
}

/**
 * Returns the names of required fields which are empty in the submitted form data.
 * The form uses "novalidate", so the server is the only place where this is checked.
 *
 * @param {Record<string, unknown>} body
 */
export function missingFields(body) {
  return REQUIRED_FIELDS.filter((name) => String(body[name] ?? "").trim() === "");
}

/**
 * Creates a post from submitted form data, keeping only known fields
 * and capping their length.
 *
 * @param {Record<string, unknown>} body
 * @returns {Post}
 */
export function createPost(body) {
  const post = toPost({ ...body, date: new Date().toISOString() });
  for (const [name, maxLength] of Object.entries(FIELDS)) {
    post[name] = post[name].slice(0, maxLength);
  }
  const slug = slugify(post.slug || post.title);
  post.slug = slug && !RESERVED_SLUGS.has(slug) ? slug : `post-${Date.now()}`;
  return post;
}

/**
 * Turns any text into a slug matching SLUG_PATTERN, e.g. "Hello World!" => "hello-world".
 *
 * @param {string} text
 */
function slugify(text) {
  return (
    text
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      // Shorten before trimming, so the cut never leaves a dash at the end.
      .slice(0, FIELDS.slug)
      .replace(/^-|-$/g, "")
  );
}
