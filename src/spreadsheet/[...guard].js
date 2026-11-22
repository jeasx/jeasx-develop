import { readListCookie, writeListCookie } from "../@helpers/cookies";
import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { DEFAULT_CELLS, toCells } from "./grid";

/**
 * Runs before the page. A POST (the form without JavaScript, or the background save of
 * "./index.jsx") saves the sheet in a signed cookie. Every other request reads the sheet:
 * Jeasx merges the returned object into the props of the page, which receives it as `cells`.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Other sites must not change the sheet with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }
  if (request.method === "POST") {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    // The cookie helpers store lists, so the cells are the only item, e.g. [{ "A1": "Trip budget" }].
    const cells = toCells(/** @type {Record<string, unknown>} */ (body));
    writeListCookie(reply, "spreadsheet", [cells], "/spreadsheet");
    // The background save with fetch only needs to know it worked. Browsers send
    // "Sec-Fetch-Mode: cors" for fetch and "navigate" for forms (old ones send neither).
    const mode = request.headers["sec-fetch-mode"];
    if (mode && mode !== "navigate") {
      return new Response(null, { status: 204 });
    }
    // A form sent without JavaScript is answered with 303, which makes the browser load
    // the sheet with GET, so a reload doesn't send the form again.
    return reply.redirect("/spreadsheet", 303);
  }
  const saved = readListCookie(request, "spreadsheet")?.[0];
  return { cells: saved ? toCells(saved) : DEFAULT_CELLS };
}
