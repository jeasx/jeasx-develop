import { renderEmail, templateName } from "./templates";

const TYPES = { html: "text/html", text: "text/plain" };

/**
 * One part of an email as a page of its own, for the preview iframes:
 * `?format=html` (default) or `?format=text`.
 *
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const name = templateName(request.query["template"]);
  const format = request.query["format"] === "text" ? "text" : "html";
  return new Response(await renderEmail.call(this, name, format), {
    headers: { "content-type": `${TYPES[format]}; charset=utf-8` },
  });
}
