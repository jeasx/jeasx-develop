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
  if (!CATEGORIES.some(({ value }) => value === category)) {
    reply.status(404);
    return [];
  }
  reply.header("cache-control", "no-store");
  return pick(category, clamp(request.query["amount"]));
}
