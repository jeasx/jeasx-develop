import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { loadContacts, pick, resetContacts, saveContacts, validate } from "./contacts";

/**
 * Runs before both routes: it loads the contacts and saves a submitted card, so the routes
 * only decide what to answer. "[index].jsx" renders the page, "[contact].jsx" a fragment.
 *
 * @param {import("../types").RouteProps} props
 * @returns {Props | Response | import("fastify").FastifyReply | undefined}
 */
export default function ({ request, reply }) {
  // Static files (e.g. "/htmx/index.js") need no contacts.
  if (reply.file) {
    return;
  }
  // Other sites must not overwrite the contacts with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  const post = request.method === "POST";
  const input = /** @type {Record<string, unknown>} */ (
    (post ? request.body : request.query) ?? {}
  );
  if (post && input.reset !== undefined) {
    resetContacts(reply);
    return reply.redirect("/htmx", 303);
  }

  // The page depends on the cookie, so caches must not hand it to other visitors.
  reply.header("cache-control", "private, no-store");

  let contacts = loadContacts(request);
  let contact = contacts.find((c) => c.id === input.id);
  if (!post || !contact) {
    return { contacts, contact, values: undefined, errors: {}, saved: false };
  }

  // Invalid answers aren't stored, but sent back, so the form can show what was typed.
  const values = pick(input);
  const errors = validate(values);
  const saved = Object.keys(errors).length === 0;
  if (saved) {
    contact = { ...contact, ...values };
    contacts = contacts.map((c) => (c.id === contact.id ? contact : c));
    saveContacts(reply, contacts);
  }
  return { contacts, contact, values, errors, saved };
}

/**
 * What the routes receive.
 *
 * @typedef {object} Props
 * @property {import("./contacts").Contact[]} contacts
 * @property {import("./contacts").Contact} [contact] the card of the request ("id"), if any
 * @property {Record<string, string>} [values] the submitted fields, after a POST
 * @property {import("./contacts").Errors} errors
 * @property {boolean} saved
 */
