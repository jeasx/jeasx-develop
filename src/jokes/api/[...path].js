import jokes from "../jokes";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Only answer "/jokes/api/<category>", not deeper paths like "/jokes/api/a/b/<category>".
  const category = /^\/jokes\/api\/([^/]+)\/?$/.exec(request.path)?.[1];
  if (!category) {
    return;
  }
  // Keep the amount between 1 and 5, even for tampered query parameters.
  const amount = Math.min(Math.max(Math.trunc(Number(request.query["amount"])) || 1, 1), 5);
  return jokes(category, amount);
}
