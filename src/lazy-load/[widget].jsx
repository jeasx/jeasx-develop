import { LoadedWidget, WIDGETS } from "./widgets";

/**
 * Answers the browser with the HTML of a single widget, including its declarative shadow root.
 *
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const name = String(request.query["name"]);
  if (!Object.hasOwn(WIDGETS, name)) {
    reply.status(404);
    return "Unknown widget";
  }
  const props = parseProps(request.query["props"]);
  if (!props) {
    reply.status(400);
    return "Props must be a JSON object";
  }
  return <LoadedWidget name={name} props={props} />;
}

/**
 * Reads the props sent by <Lazy>. Anyone can change the query string, so the result is only
 * guaranteed to be a plain object: every component checks its own props.
 *
 * @param {unknown} value
 * @returns {Record<string, unknown> | null}
 */
function parseProps(value) {
  if (value === undefined) return {};
  try {
    const props = JSON.parse(String(value));
    return props && typeof props === "object" && !Array.isArray(props) ? props : null;
  } catch {
    return null;
  }
}
