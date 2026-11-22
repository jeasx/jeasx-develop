import Layout from "../Layout";
import { Activity, ContactForm, ContactView } from "./Contact";

/**
 * The full page. With HTMX, only the cards change (see "[contact].jsx"). Without
 * JavaScript, the same links and forms land here: "?edit=ada" opens a card as a form,
 * and a submitted form is redirected back once saved, or shown again with its errors.
 * Loading, saving and resetting happen in "[...guard].js".
 *
 * @param {import("../types").RouteProps & import("./[...guard]").Props} props
 */
export default function ({ request, reply, contacts, contact, values, errors, saved }) {
  let editing = "";
  if (request.method === "POST" && contact) {
    if (saved) {
      return reply.redirect("/htmx", 303);
    }
    reply.status(422);
    editing = contact.id;
  } else {
    const query = /** @type {Record<string, unknown>} */ (request.query ?? {});
    editing = typeof query.edit === "string" ? query.edit : "";
  }

  return (
    <Layout
      title="Click to edit with HTMX"
      description="Edit contact cards in place with HTMX: server-rendered fragments, validation and out-of-band updates."
      css="/htmx/index.css"
      script="/htmx/index.js"
    >
      <div class="cte">
        <h1>Click to edit</h1>
        <p class="lead">
          Every Jeasx route can return an HTML fragment, which makes Jeasx a perfect match for{" "}
          <a href="https://four.htmx.org">HTMX</a>.
        </p>
        <p>
          Edit any card: HTMX fetches the form from the server and swaps it in place. Saving is
          validated on the server, which answers with the updated card, or with the form and its
          errors. The line below is updated out of band with the same response. Without JavaScript,
          the same links and forms reload the page.
        </p>
        <Activity />
        <div class="cte-cards">
          {contacts.map((card) =>
            // Only one card is a form at a time, so the submitted values and errors are its own.
            card.id === editing ? (
              <ContactForm contact={card} values={values} errors={errors} />
            ) : (
              <ContactView contact={card} />
            ),
          )}
        </div>
        <form method="post" action="/htmx" class="cte-reset">
          <button type="submit" name="reset" value="1" class="outline secondary">
            Reset contacts
          </button>
          <small>Changes are kept in a cookie in your browser.</small>
        </form>
      </div>
    </Layout>
  );
}
