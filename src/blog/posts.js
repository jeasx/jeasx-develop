// Browsers silently drop cookies larger than about 4 KB (name, value and attributes).
const MAX_COOKIE_SIZE = 3800;
const FIELDS = { slug: 100, title: 100, author: 100, description: 200, body: 1000 };

/**
 * Reads posts from the cookie; falls back if it is missing or malformed.
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {any[]} fallback
 */
export function readPosts(request, fallback = []) {
  try {
    const posts = JSON.parse(request.cookies["posts"]);
    return Array.isArray(posts)
      ? posts.filter((post) => post && typeof post === "object")
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Stores posts in the cookie, dropping the oldest ones until it fits.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {any[]} posts
 */
export function writePosts(reply, posts) {
  const kept = [...posts];
  while (kept.length > 1 && encodeURIComponent(JSON.stringify(kept)).length > MAX_COOKIE_SIZE) {
    kept.pop();
  }
  reply.setCookie("posts", JSON.stringify(kept));
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
  return { ...post, date: new Date().toISOString() };
}
