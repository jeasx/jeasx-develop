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
      css="/login/index.css"
    >
      <h1>Login and sessions</h1>
      <p>
        This example stores a random session id in a cookie and keeps the session data on the
        server. Passwords are hashed with scrypt from <code>node:crypto</code>. A guard checks the
        CSRF token of every form, limits the attempts per IP address and looks up the session for
        all routes below it. Users and sessions live in memory, so they are gone after a restart.
      </p>

      {session ? (
        <article class="card-success account">
          <header class="account-header">
            <span class="avatar" aria-hidden="true">
              {session.username.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>Welcome, {session.username}</strong>
              <br />
              <small>You are signed in.</small>
            </div>
          </header>
          <dl class="account-details">
            <dt>Email</dt>
            <dd>
              <code>{session.email}</code>
            </dd>
            <dt>Session expires</dt>
            <dd>
              <time datetime={new Date(session.expires).toISOString()}>
                {new Date(session.expires).toISOString().replace("T", " ").slice(0, 19)} UTC
              </time>
              <br />
              <small>Every request extends it by 30 minutes.</small>
            </dd>
          </dl>
          <footer>
            <form method="post" action={`${PATH}/logout`}>
              <input type="hidden" name="_csrf" value={csrfToken} />
              <button class="btn btn-secondary" type="submit">
                Sign out
              </button>
            </form>
          </footer>
        </article>
      ) : (
        <article class="auth-card">
          <header>
            <strong>Sign in</strong>
          </header>
          <p class="alert alert-info">
            Use the demo account <kbd>demo</kbd> / <kbd>jsx-with-ease</kbd>.
          </p>
          {error && (
            <p class="alert alert-error" role="alert">
              {error}
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
            <button class="btn btn-primary wide" type="submit">
              Sign in
            </button>
          </form>
          <footer class="center">
            <small>
              No account yet? <a href={`${PATH}/register`}>Create one</a>
            </small>
          </footer>
        </article>
      )}
    </Layout>
  );
}
