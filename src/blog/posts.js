import { readListCookie, writeListCookie } from "../cookies";
import data from "./data.json";

const FIELDS = { slug: 100, title: 100, author: 100, description: 200, body: 1000 };
// Slugs end up in links, so only allow safe characters (no "javascript:" etc.).
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// "/blog/post" is the form for new posts, so posts with these slugs could never be opened.
const RESERVED_SLUGS = new Set(["post"]);

/**
 * Reads posts from the cookie; falls back to the example posts if it is missing or malformed.
 *
 * @param {import("fastify").FastifyRequest} request
 */
export function readPosts(request) {
  // The cookie can be edited by the client, so drop posts with invalid slugs.
  // Return a copy of the example data, so callers can add posts without changing it.
  return (
    readListCookie(request.cookies["posts"])?.filter((post) =>
      SLUG_PATTERN.test(String(post.slug)),
    ) ?? [...data]
  );
}

/**
 * Stores posts in the cookie, dropping the oldest ones until it fits.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {any[]} posts
 */
export function writePosts(reply, posts) {
  writeListCookie(reply, "posts", posts);
}

/**
 * Creates a post from submitted form data, keeping only known fields
 * and capping their length.
 *
 * @param {Record<string, unknown>} body
 */
export function createPost(body) {
  const post = {};
  for (const [name, maxLength] of Object.entries(FIELDS)) {
    post[name] = String(body[name] ?? "").slice(0, maxLength);
  }
  const slug = slugify(post["slug"] || post["title"]);
  post["slug"] = slug && !RESERVED_SLUGS.has(slug) ? slug : `post-${Date.now()}`;
  return { ...post, date: new Date().toISOString() };
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
