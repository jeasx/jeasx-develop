// Only echo harmless headers. Hosting platforms and proxies add their own headers,
// some carrying credentials (e.g. tokens), and page scripts could read them here.
const SAFE_HEADERS = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "cache-control",
  "content-length",
  "content-type",
  "host",
  "referer",
  "user-agent",
]);

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // The answer contains the visitor's own headers (e.g. a referer with private URLs),
  // so caches must not hand it to others.
  reply.header("cache-control", "private, no-store");
  // The query is echoed as it is (e.g. "<script>"): never let browsers guess HTML from it.
  reply.header("x-content-type-options", "nosniff");
  const { url, path, route, query, method } = request;
  const headers = Object.fromEntries(
    Object.entries(request.headers).filter(([name]) => SAFE_HEADERS.has(name)),
  );
  return {
    url,
    path,
    route,
    query,
    method,
    headers,
    // Only the runtime version (as in the footer): process.versions would also reveal
    // the exact versions of OpenSSL, V8 and other libraries, which helps attackers.
    runtime: process.versions.bun ? `Bun@${process.versions.bun}` : `Node@${process.versions.node}`,
  };
}
