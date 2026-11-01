import { Releases, toPage } from "./releases";

/**
 * Answers HTMX with the rows of a single page.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const page = toPage(request.query["page"]);
  return <Releases from={page} to={page} />;
}
