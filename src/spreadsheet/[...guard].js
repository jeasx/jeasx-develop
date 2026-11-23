import { readObjectCookie } from "../@helpers/cookies";
import formBody from "../@helpers/formBody";
import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { DEFAULT_CELLS, toCells } from "./grid";

const PATH = "/spreadsheet";

/**
 * Runs before the page. A POST (the form without JavaScript, or the background save of
 * "./index.jsx") saves the sheet in a signed cookie. Every other request reads the sheet:
 * Jeasx merges the returned object into the props of the page, which receives it as `cells`.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files like index.css need no cookie.
  if (reply.file) {
    return;
  }
  // Other sites must not change the sheet with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }
  if (request.method === "POST") {
    // The cells are stored as one object, e.g. { "A1": "Trip budget" }.
    const cells = toCells(formBody(request));
    reply.setCookie("spreadsheet", JSON.stringify(cells), { path: PATH, signed: true });
    // The background save with fetch only needs to know it worked.
    if (request.headers.accept?.includes("application/json")) {
      return reply.status(204).send();
    }
    // A form sent without JavaScript is answered with 303, which makes the browser load
    // the sheet with GET, so a reload doesn't send the form again.
    return reply.redirect(PATH, 303);
  }
  const saved = readObjectCookie(request, "spreadsheet");

  // The page depends on the cookie, so caches must not hand it to other visitors.
  reply.header("cache-control", "private, no-store");
  return { cells: saved ? toCells(saved) : DEFAULT_CELLS };
}
