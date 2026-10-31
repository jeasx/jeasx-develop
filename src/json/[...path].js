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
  const { url, path, route, query, method, body } = request;
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
    body,
    runtime: process.versions,
  };
}
