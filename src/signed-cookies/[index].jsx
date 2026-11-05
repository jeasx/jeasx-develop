import Layout from "../Layout";
import { readSigned } from "../@helpers/cookies";

const PATH = "/signed-cookies";
// Small limits keep the cookie well below 4 KB, even for characters like "€"
// which grow to 9 characters once encoded.
const MAX_NOTES = 3;
const MAX_LENGTH = 80;

/**
 * @param {import("../types").RouteProps & { csrfToken: string }} props
 */
export default function ({ request, reply, csrfToken }) {
  const cookie = readSigned(request, "notes");
  const notes = cookie.status === "valid" ? parseNotes(cookie.value) : [];

  // The guard has already checked the CSRF token of every POST.
  if (request.method === "POST") {
    const body = /** @type {Record<string, unknown>} */ (request.body);
    switch (body["action"]) {
      case "add": {
        const note = String(body["note"] ?? "")
          .trim()
          .slice(0, MAX_LENGTH);
        if (note) {
          const value = JSON.stringify([note, ...notes].slice(0, MAX_NOTES));
          reply.setCookie("notes", value, { path: PATH, signed: true });
        }
        break;
      }
      case "tamper": {
        // Do what an attacker would do in the browser: change the value, keep the signature.
        const signed = request.cookies["notes"] ?? "";
        const signature = signed.slice(signed.lastIndexOf(".") + 1);
        const value = JSON.stringify(["Added in the browser", ...notes].slice(0, MAX_NOTES));
        reply.setCookie("notes", `${value}.${signature}`, { path: PATH });
        break;
      }
      case "clear":
        reply.clearCookie("notes", { path: PATH });
        break;
    }
    // 303 makes the browser load the page with GET, so a reload doesn't resubmit the form.
    return reply.redirect(PATH, 303);
  }

  return (
    <Layout
      title="Signed cookies and CSRF tokens"
      description="Detect edited cookies with signatures and protect forms against cross-site request forgery."
      css="/signed-cookies/index.css"
    >
      <h1>Signed cookies and CSRF tokens</h1>
      <p>
        Cookies are stored in the browser, so visitors can edit them. With a secret configured for{" "}
        <code>@fastify/cookie</code> in <code>jeasx.config.js</code>, a route can set a cookie with{" "}
        <code>{"{ signed: true }"}</code>: its value gets a signature, and{" "}
        <code>request.unsignCookie()</code> tells whether the value is still the one the server
        wrote.
      </p>
      <p>
        A guard protects all forms of this example against cross-site request forgery: it stores a
        random token in a signed cookie and only accepts forms which send the same token in a hidden
        field. Have a look at the source to see how it works.
      </p>

      <article class="notes">
        <header class="notes-header">
          <strong>Notes</strong>
          {cookie.status === "missing" && <span class="badge badge-secondary">No cookie</span>}
          {cookie.status === "valid" && <span class="badge badge-success">Signature valid</span>}
          {cookie.status === "invalid" && <span class="badge badge-error">Signature invalid</span>}
        </header>
        {cookie.status === "invalid" && (
          <p class="alert alert-error" role="alert">
            The notes cookie was changed after it was signed, so it is ignored.
          </p>
        )}
        {notes.length > 0 ? (
          <ul class="notes-list">
            {notes.map((note) => (
              <li>{note}</li>
            ))}
          </ul>
        ) : (
          <p class="notes-empty">
            {cookie.status === "missing"
              ? "No notes yet. Add one to create the cookie."
              : "No notes."}
          </p>
        )}
        <form method="post">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <input type="hidden" name="action" value="add" />
          <fieldset role="group">
            <input
              name="note"
              maxlength={MAX_LENGTH}
              placeholder="Write a note…"
              aria-label="Note"
              required
            />
            <button class="btn btn-primary" type="submit">
              Add
            </button>
          </fieldset>
        </form>
        {request.cookies["notes"] && (
          <footer>
            <small>Cookie value (value.signature)</small>
            <code class="cookie-value">{request.cookies["notes"]}</code>
          </footer>
        )}
      </article>

      <h2>Try it</h2>
      <div class="actions">
        <form method="post" class="action">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button class="btn btn-warning" type="submit" name="action" value="tamper">
            Edit the cookie
          </button>
          <small>Changes the value like an attacker would, but keeps the signature.</small>
        </form>
        <form method="post" class="action">
          <button class="btn btn-error" type="submit" name="action" value="add">
            Send without token
          </button>
          <small>Posts a form without CSRF token, like a forged form on another site.</small>
        </form>
        <form method="post" class="action">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button class="btn btn-secondary" type="submit" name="action" value="clear">
            Clear notes
          </button>
          <small>Deletes the notes cookie.</small>
        </form>
      </div>
    </Layout>
  );
}

/**
 * A valid signature proves that this server wrote the value, but not for which cookie:
 * it covers only the value, so the signed CSRF token pasted into the notes cookie passes too.
 * Hence the value is still checked to be a list of strings.
 *
 * @param {string} value
 * @returns {string[]}
 */
function parseNotes(value) {
  try {
    const notes = JSON.parse(value);
    return Array.isArray(notes) ? notes.filter((note) => typeof note === "string") : [];
  } catch {
    return [];
  }
}
