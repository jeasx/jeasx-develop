import { html, jsxToString } from "jsx-async-runtime";
import cache from "../@helpers/cache";

/**
 * Rendered markup of all <Cached> components, kept for 30 seconds.
 * Each route bundles its own copy of this module, so other routes don't share the entries.
 */
const TTL = 30;
const cached = cache({ ttl: TTL * 1000 });

/**
 * @typedef {object} CacheInfo
 * @property {boolean} hit Whether the markup came from the cache.
 * @property {number} age Seconds since the markup was rendered.
 * @property {number} expiresIn Seconds until the cached markup is rendered again.
 * @property {number} ttl Seconds the markup is kept in total.
 * @property {number} ms Milliseconds this request waited for the markup.
 */

/**
 * Renders its children once and keeps the resulting HTML, so later requests skip the work.
 * The key must contain everything the children depend on (e.g. query parameters), since the
 * cache only sees the key: content for one visitor (e.g. a name from the session) must never
 * be cached under a key shared by others.
 *
 * Requests arriving while the children are still rendering share that one render.
 *
 * @this {object}
 * @param {object} props
 * @param {string} props.cacheKey Identifies the content, e.g. "report:europe".
 * @param {JSX.Element} props.children
 * @param {(info: CacheInfo) => JSX.Element} [props.status] Renders a hint about the cache state.
 */
export default async function Cached({ cacheKey, children, status }) {
  const start = performance.now();
  let rendered = false;
  const entry = await cached(cacheKey, async () => {
    rendered = true;
    // `this` is passed on, so the children can still read the request context.
    const markup = await jsxToString.call(this, children);
    return { markup, renderedAt: Date.now() };
  });

  const ms = Math.round(performance.now() - start);
  const age = Math.round((Date.now() - entry.renderedAt) / 1000);
  return (
    <>
      {status?.({ hit: !rendered, age, expiresIn: Math.max(0, TTL - age), ttl: TTL, ms })}
      {/* The markup was produced by jsxToString, so it is already escaped and safe to insert. */}
      {html(entry.markup)}
    </>
  );
}
