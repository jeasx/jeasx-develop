import formBody from "../@helpers/formBody";
import ServerList from "./ServerList";
import { reduceForm } from "./shopping";
import { loadItems, saveItems, FRAMEWORKS } from "./store";

/**
 * Handles the forms of all versions. The pressed button names the action.
 * Versions which render in the browser only need the save, HTMX gets the updated list as
 * a fragment, and a plain form submit (without JavaScript) a redirect back to the page.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method !== "POST") {
    return reply.redirect("/showdown", 303);
  }
  const body = formBody(request);
  const framework = FRAMEWORKS.find((name) => name === body.framework);
  if (!framework) {
    return reply.redirect("/showdown", 303);
  }
  const items = reduceForm(loadItems(request, framework), body);
  saveItems(reply, framework, items);

  // The browser already rendered the change itself, it only needs the cookie.
  if (request.headers.accept?.includes("application/json")) {
    return reply.status(204).send();
  }
  if (request.headers["hx-request"]) {
    reply.header("cache-control", "private, no-store");
    return <ServerList framework="htmx" items={items} />;
  }
  return reply.redirect(`/showdown#${framework}`, 303);
}
