import csrf from "../@helpers/csrf";

/**
 * Protects all forms of this example against cross-site request forgery (CSRF)
 * with a "signed double-submit cookie" (see "../@helpers/csrf.jsx" for how it works).
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Static files need no token.
  if (reply.file) {
    return;
  }

  const { token, rejection } = csrf({ request, reply }, "/signed-cookies");
  if (rejection) {
    return rejection;
  }

  // Routes below receive the token as prop to put it into their forms.
  return { csrfToken: token };
}
