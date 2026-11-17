import { pick } from "./jokes";
import { CATEGORIES, clamp } from "./state";

/**
 * Random jokes with setup and punchline for the browser (see "./index.jsx"),
 * e.g. "/jokes/pick?category=general&amount=3".
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const category = String(request.query["category"] ?? "");
  // Unknown categories are answered with 404.
  if (!CATEGORIES.some(({ value }) => value === category)) {
    reply.status(404);
    return [];
  }
  reply.header("cache-control", "no-store");
  // clamp keeps the amount between 1 and 5, even for tampered query parameters.
  return pick(category, clamp(request.query["amount"]));
}
