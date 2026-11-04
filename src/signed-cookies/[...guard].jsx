import { randomBytes } from "node:crypto";
import isSameToken from "../@helpers/isSameToken";
import Layout from "../Layout";
import readSigned from "./signed";

/**
 * Protects all forms of this example against cross-site request forgery (CSRF)
 * with a "signed double-submit cookie": a random token is stored in a signed cookie
 * and repeated in a hidden field of every form. Other sites can't read the cookie,
 * so they can't put the right token into a forged form. The signature stops them
 * from planting a cookie with a token of their own, e.g. from a subdomain.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files need no token.
  if (reply.file) {
    return;
  }

  const cookie = readSigned(request, "csrf");
  let token = cookie.value;
  if (!token) {
    token = randomBytes(32).toString("base64url");
    // "lax", so following a link from another site keeps the token: with "strict",
    // the cookie would be missing and a new token would break forms open in other tabs.
    reply.setCookie("csrf", token, { path: "/signed-cookies", signed: true, sameSite: "lax" });
  }

  if (request.method === "POST") {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    if (!isSameToken(String(body["_csrf"] ?? ""), token)) {
      reply.status(403);
      return (
        <Layout title="Error 403" robots="noindex">
          <section class="center">
            <h1>Error 403</h1>
            <p>The form was rejected, as its CSRF token is missing or doesn't match.</p>
            <a href="/signed-cookies">Back to the example</a>
          </section>
        </Layout>
      );
    }
  }

  // Routes below receive the token as prop to put it into their forms.
  return { csrfToken: token };
}
