/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const { url, path, route, query, method, headers, body } = request;
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
