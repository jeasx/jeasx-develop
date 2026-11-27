import formBody from "../@helpers/formBody";
import ServerList from "./ServerList";
import { reduceForm } from "./shopping";
import { loadItems, saveItems } from "./store";

/**
 * Handles the forms of the Jeasx and HTMX versions. The pressed button names the action.
 * The Jeasx version renders in the browser and only needs the save, HTMX gets the updated
 * list as a fragment, and a plain form submit (without JavaScript) a redirect back to the page.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method !== "POST") {
    return reply.redirect("/four-ways", 303);
  }
  const body = formBody(request);
  const way = body.way === "htmx" ? "htmx" : "jeasx";
  const items = reduceForm(loadItems(request, way), body);
  saveItems(reply, way, items);

  // The browser already rendered the change itself, it only needs the cookie.
  if (request.headers.accept?.includes("application/json")) {
    return reply.status(204).send();
  }
  if (request.headers["hx-request"]) {
    reply.header("cache-control", "private, no-store");
    return <ServerList way={way} items={items} />;
  }
  return reply.redirect(`/four-ways#${way}`, 303);
}
