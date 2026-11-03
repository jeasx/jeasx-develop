import Layout from "../Layout";
import Field from "./Field";
import { PATH, endSession, startSession } from "./session";
import { createUser } from "./store";
import { EMAIL_MAX_LENGTH, PASSWORD, USERNAME, validateRegistration } from "./validate";

const LABELS = {
  username: "Username",
  email: "Email",
  password: "Password",
  confirm: "Repeat password",
  terms: "Terms",
};

/**
 * A registration form validated on the server. Invalid forms are shown again with the
 * entered values (except passwords), a summary of all errors and a message at each field.
 *
 * @param {import("../types").RouteProps & {
 *   csrfToken: string,
 *   session?: ReturnType<typeof import("./store").getSession>
 * }} props
 */
export default async function ({ request, reply, csrfToken, session }) {
  /** @type {ReturnType<typeof validateRegistration>} */
  let form = {
    values: {
      username: "",
      email: "",
      password: "",
      confirm: "",
      terms: false,
    },
    errors: {},
  };

  // The guard has already checked the CSRF token of every POST.
  if (request.method === "POST") {
    form = validateRegistration(request.body);
    if (Object.keys(form.errors).length === 0) {
      const result = await createUser(
        form.values.username,
        form.values.email,
        form.values.password,
      );
      if (result === "created") {
        endSession(reply, session?.id);
        startSession(reply, form.values.username);
        return reply.redirect(PATH, 303);
      }
      form.errors.username =
        result === "taken"
          ? "This username is taken, please choose another one."
          : "This demo has reached its maximum number of accounts. Please try again after the next restart.";
    }
    // 422 tells clients (and tests) that the form was understood but not accepted.
    reply.status(422);
  }

  const { values, errors } = form;
  const errorList = Object.entries(errors);

  return (
    <Layout
      title="Create an account"
      description="A registration form with validation on the server."
      robots="noindex"
    >
      <h1>Create an account</h1>
      <p>
        The browser checks the fields via HTML attributes before sending. Use the second button to
        skip these checks and see the validation on the server, which works the same without
        JavaScript.
      </p>

      {errorList.length > 0 && (
        <article role="alert">
          <strong>Please correct {errorList.length === 1 ? "this error" : "these errors"}:</strong>
          <ul>
            {errorList.map(([name, message]) => (
              <li>
                <a href={`#${name}`}>{LABELS[name]}</a>: {message}
              </li>
            ))}
          </ul>
        </article>
      )}

      <form method="post">
        <input type="hidden" name="_csrf" value={csrfToken} />
        <Field
          label="Username"
          name="username"
          value={values.username}
          error={errors.username}
          hint="Letters, digits, dashes and underscores."
          minlength={USERNAME.minLength}
          maxlength={USERNAME.maxLength}
          pattern={USERNAME.pattern}
          autocomplete="username"
          autocapitalize="none"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={values.email}
          error={errors.email}
          maxlength={EMAIL_MAX_LENGTH}
          autocomplete="email"
          required
        />
        {/* Passwords are never sent back to the browser, not even after an error. */}
        <Field
          label="Password"
          name="password"
          type="password"
          error={errors.password}
          hint={`At least ${PASSWORD.minLength} characters.`}
          minlength={PASSWORD.minLength}
          maxlength={PASSWORD.maxLength}
          autocomplete="new-password"
          required
        />
        <Field
          label="Repeat password"
          name="confirm"
          type="password"
          error={errors.confirm}
          autocomplete="new-password"
          required
        />
        <label>
          <input
            type="checkbox"
            name="terms"
            id="terms"
            checked={values.terms}
            aria-invalid={errors.terms ? "true" : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            required
          />{" "}
          I accept that this demo forgets my account on the next restart.
        </label>
        {/* Outside the label, as it would overlap the checkbox there.
            µCSS only colors a <small> right after the invalid input, so set the color here. */}
        {errors.terms && (
          <p>
            <small id="terms-error" style="color: var(--mu-del-color)">
              {errors.terms}
            </small>
          </p>
        )}
        <div class="row">
          <button class="btn btn-primary" type="submit">
            Create account
          </button>{" "}
          <button class="btn btn-secondary" type="submit" formnovalidate>
            Send without browser checks
          </button>
        </div>
      </form>
      <p>
        Already registered? <a href={PATH}>Sign in</a>
      </p>
    </Layout>
  );
}
