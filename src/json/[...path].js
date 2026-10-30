// Never echo credentials: page scripts could read them here,
// which would undo the protection of httpOnly cookies.
const SENSITIVE_HEADERS = new Set(["cookie", "authorization", "proxy-authorization"]);

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const { url, path, route, query, method, body } = request;
  const headers = Object.fromEntries(
    Object.entries(request.headers).filter(([name]) => !SENSITIVE_HEADERS.has(name)),
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
