import jokes from "../jokes";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const category = request.path.slice(request.path.lastIndexOf("/") + 1);
  // Keep the amount between 1 and 5, even for tampered query parameters.
  const amount = Math.min(Math.max(Math.trunc(Number(request.query["amount"])) || 1, 1), 5);
  return jokes(category, amount);
}
