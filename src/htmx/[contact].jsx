// The fragment route HTMX talks to. It answers with a single card, never a whole page:
// - GET  ?id=ada        the card to view (e.g. after Cancel)
// - GET  ?id=ada&edit   the card as a form
// - POST id=ada&…       the saved card, or 422 with the form and its errors.
//                       HTMX 4 swaps error responses, too, so the errors show up in place.
// Loading and saving happen in "[...guard].js".
import { Activity, ContactForm, ContactView } from "./Contact";

/**
 * @param {import("../types").RouteProps & import("./[...guard]").Props} props
 */
export default function ({ request, reply, contact, values, errors, saved }) {
  if (!contact) {
    return reply.status(404).send("Unknown contact");
  }
  if (request.method !== "POST") {
    const query = /** @type {Record<string, unknown>} */ (request.query ?? {});
    return "edit" in query ? <ContactForm contact={contact} /> : <ContactView contact={contact} />;
  }
  if (!saved) {
    reply.status(422);
    return <ContactForm contact={contact} values={values} errors={errors} />;
  }
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" });
  return (
    <>
      <ContactView contact={contact} saved />
      <Activity oob message={`${contact.name} was saved at ${time} UTC.`} />
    </>
  );
}
