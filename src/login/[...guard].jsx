import { readSignedCookie } from "../@helpers/cookies";
import csrf from "../@helpers/csrf";
import Layout from "../Layout";
import { countAttempt } from "./attempts";
import { PATH } from "./session";
import { getSession } from "./store";

/**
 * Runs before every route of this example:
 * - checks the CSRF token of every POST (see "../@helpers/csrf.jsx"),
 * - limits the number of POSTs per IP address, as each one may hash a password,
 * - looks up the session of the visitor.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files need neither token nor session.
  if (reply.file) {
    return;
  }

  // Pages with a login form or personal data must not end up in a shared cache.
  reply.header("cache-control", "no-store");

  const { token: csrfToken, rejection } = csrf({ request, reply }, PATH);
  if (rejection) {
    return rejection;
  }

  if (request.method === "POST") {
    const wait = countAttempt(request.ip);
    if (wait > 0) {
      reply.status(429).header("retry-after", String(wait));
      return (
        <Layout title="Error 429" robots="noindex">
          <section class="center">
            <h1>Error 429</h1>
            <p>Too many attempts. Please wait {wait} seconds and try again.</p>
            <a href={PATH}>Back to the example</a>
          </section>
        </Layout>
      );
    }
  }

  // The session cookie holds only a random id: the data stays on the server.
  // Signing the id isn't needed for security, but rejects guessed ids without a lookup.
  const session = getSession(readSignedCookie(request, "session"));

  // Routes below receive these as props.
  return { csrfToken, session };
}
