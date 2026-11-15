/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const { url, path, route, query, method } = request;
  return Response.json({
    url,
    path,
    route,
    query,
    method,
    runtime: process.versions.bun ? `Bun@${process.versions.bun}` : `Node@${process.versions.node}`,
  });
}
