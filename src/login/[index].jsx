import Layout from "../Layout";
import Field from "./Field";
import { PATH, endSession, startSession } from "./session";
import { verifyUser } from "./store";
import { PASSWORD, field } from "./validate";

/**
 * Shows the sign-in form or, with a session, the account of the user.
 *
 * @param {import("../types").RouteProps & {
 *   csrfToken: string,
 *   session?: ReturnType<typeof import("./store").getSession>
 * }} props
 */
export default async function ({ request, reply, csrfToken, session }) {
  let username = "";
  let error = "";

  // The guard has already checked the CSRF token of every POST.
  if (request.method === "POST") {
    username = field(request.body, "username").toLowerCase();
    const password = field(request.body, "password", { trim: false });
    if (!username || !password) {
      error = "Please enter username and password.";
    } else if (password.length > PASSWORD.maxLength) {
      // Registration doesn't allow longer passwords, so don't spend time hashing them.
      error = "Wrong username or password.";
    } else if (await verifyUser(username, password)) {
      // Replace any existing session, so an id known before login becomes worthless.
      endSession(reply, session?.id);
      startSession(reply, username);
      // 303 makes the browser load the page with GET, so a reload doesn't resubmit the form.
      return reply.redirect(PATH, 303);
    } else {
      // Don't tell whether the username or the password was wrong:
      // that would reveal which usernames exist.
      error = "Wrong username or password.";
    }
    reply.status(422);
  }

  return (
    <Layout
      title="Login and sessions"
      description="Sign in with a session cookie, validate forms on the server and protect them against CSRF."
    >
      <h1>Login and sessions</h1>
      <p>
        This example stores a random session id in a cookie and keeps the session data on the
        server. Passwords are hashed with scrypt from <code>node:crypto</code>. A guard checks the
        CSRF token of every form, limits the attempts per IP address and looks up the session for
        all routes below it. Users and sessions live in memory, so they are gone after a restart.
      </p>

      {session ? (
        <section>
          <h2>Welcome, {session.username}</h2>
          <p>You are signed in. Your session ends after 30 minutes without requests.</p>
          <ul>
            <li>
              Email: <code>{session.email}</code>
            </li>
            <li>
              Session expires: <code>{new Date(session.expires).toISOString()}</code>
            </li>
          </ul>
          <form method="post" action={`${PATH}/logout`} class="center">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <button class="btn btn-primary" type="submit">
              Sign out
            </button>
          </form>
        </section>
      ) : (
        <section>
          <h2>Sign in</h2>
          <p>
            Use <code>demo</code> / <code>jsx-with-ease</code> or{" "}
            <a href={`${PATH}/register`}>create an account</a>.
          </p>
          {error && (
            <p role="alert">
              <mark>{error}</mark>
            </p>
          )}
          <form method="post">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <Field
              label="Username"
              name="username"
              value={username}
              autocomplete="username"
              autocapitalize="none"
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />
            <button class="btn btn-primary" type="submit">
              Sign in
            </button>
          </form>
        </section>
      )}
    </Layout>
  );
}
