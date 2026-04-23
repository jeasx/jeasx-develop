import jokes from "../jokes.js";

/**
 * @param {import("../../types.js").RouteProps} props
 */
export default function ({ request, reply }) {
  const category = request.path.substring(request.route.lastIndexOf("/") + 1);
  const amount = request.query["amount"] || 1;
  return jokes(category, amount);
}
