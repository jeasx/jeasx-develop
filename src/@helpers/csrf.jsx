import { randomBytes } from "node:crypto";
import Layout from "../Layout";
import { readSignedCookie } from "./cookies";
import isSameToken from "./isSameToken";

/**
 * Protects forms against cross-site request forgery (CSRF) with a "signed double-submit
 * cookie": a random token is stored in a signed cookie and repeated in a hidden "_csrf"
 * field of every form. Other sites can't read the cookie, so they can't put the right token
 * into a forged form. The signature stops them from planting a cookie with a token of their
 * own, e.g. from a subdomain. See the "signed-cookies" example.
 *
 * Returns the token to put into forms and, for a POST with a missing or wrong token,
 * an error page to answer with.
 *
 * @param {import("../types").RouteProps} props
 * @param {string} path Path of the example, so the cookie isn't sent to other examples.
 */
export default function csrf({ request, reply }, path) {
  let token = readSignedCookie(request, "csrf");
  if (!token) {
    token = randomBytes(32).toString("base64url");
    // "lax", so following a link from another site keeps the token: with "strict",
    // the cookie would be missing and a new token would break forms open in other tabs.
    reply.setCookie("csrf", token, { path, signed: true, sameSite: "lax" });
  }

  if (request.method === "POST") {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    if (!isSameToken(String(body["_csrf"] ?? ""), token)) {
      reply.status(403);
      return {
        token,
        rejection: (
          <Layout title="Error 403" robots="noindex">
            <section class="center">
              <h1>Error 403</h1>
              <p>The form was rejected, as its CSRF token is missing or doesn't match.</p>
              <a href={path}>Back to the example</a>
            </section>
          </Layout>
        ),
      };
    }
  }

  return { token };
}
