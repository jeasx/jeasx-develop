import { randomBytes, timingSafeEqual } from "node:crypto";
import { readSignedCookie } from "../@helpers/cookies";
import Layout from "../Layout";
import { countAttempt } from "./attempts";
import { PATH } from "./session";
import { getSession } from "./store";

/**
 * Runs before every route of this example:
 * - checks the CSRF token of every POST (see the "signed-cookies" example for details),
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

  let csrfToken = readSignedCookie(request, "csrf");
  if (!csrfToken) {
    csrfToken = randomBytes(32).toString("base64url");
    reply.setCookie("csrf", csrfToken, { path: PATH, signed: true });
  }

  if (request.method === "POST") {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    if (!isSameToken(String(body["_csrf"] ?? ""), csrfToken)) {
      reply.status(403);
      return (
        <Layout title="Error 403" robots="noindex">
          <section class="center">
            <h1>Error 403</h1>
            <p>The form was rejected, as its CSRF token is missing or doesn't match.</p>
            <a href={PATH}>Back to the example</a>
          </section>
        </Layout>
      );
    }

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

/**
 * Compares in constant time, so response times don't reveal how much of a guess was right.
 *
 * @param {string} actual
 * @param {string} expected
 */
function isSameToken(actual, expected) {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
