// Validation rules for the forms of this example. Browsers check the same rules via HTML
// attributes (required, minlength, pattern, ...), but those are only a convenience:
// anyone can send a request without them, so the server checks everything again.

export const USERNAME = {
  minLength: 3,
  maxLength: 20,
  // Uppercase letters are allowed, as the username is lowercased before it is checked.
  pattern: "[a-zA-Z0-9_\\-]+",
};
export const PASSWORD = { minLength: 10, maxLength: 128 };
export const EMAIL_MAX_LENGTH = 254;

/**
 * Reads a field as trimmed string. Ignores lists and other types, which a form
 * sends e.g. when a field name appears twice.
 *
 * @param {unknown} body
 * @param {string} name
 * @param {{ trim?: boolean }} [options]
 */
export function field(body, name, { trim = true } = {}) {
  const value = body && typeof body === "object" ? body[name] : undefined;
  if (typeof value !== "string") {
    return "";
  }
  return trim ? value.trim() : value;
}

/**
 * @typedef {{ username: string, email: string, password: string, confirm: string, terms: boolean }} Registration
 * @typedef {Partial<Record<keyof Registration, string>>} Errors
 */

/**
 * @param {unknown} body
 * @returns {{ values: Registration, errors: Errors }}
 */
export function validateRegistration(body) {
  const values = {
    username: field(body, "username").toLowerCase(),
    email: field(body, "email"),
    // Passwords are taken as they are: spaces at the ends may be on purpose.
    password: field(body, "password", { trim: false }),
    confirm: field(body, "confirm", { trim: false }),
    terms: field(body, "terms") === "on",
  };
  /** @type {Errors} */
  const errors = {};

  if (!values.username) {
    errors.username = "Please choose a username.";
  } else if (
    values.username.length < USERNAME.minLength ||
    values.username.length > USERNAME.maxLength
  ) {
    errors.username = `The username needs ${USERNAME.minLength} to ${USERNAME.maxLength} characters.`;
  } else if (!new RegExp(`^${USERNAME.pattern}$`).test(values.username)) {
    errors.username = "Use only letters, digits, dashes and underscores.";
  }

  if (!values.email) {
    errors.email = "Please enter your email address.";
  } else if (
    values.email.length > EMAIL_MAX_LENGTH ||
    // Deliberately loose: the only real check is sending a confirmation mail.
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  ) {
    errors.email = "Please enter a valid email address like name@example.com.";
  }

  if (!values.password) {
    errors.password = "Please choose a password.";
  } else if (values.password.length < PASSWORD.minLength) {
    errors.password = `The password needs at least ${PASSWORD.minLength} characters.`;
  } else if (values.password.length > PASSWORD.maxLength) {
    errors.password = `The password may have at most ${PASSWORD.maxLength} characters.`;
  } else if (values.username && values.password.toLowerCase().includes(values.username)) {
    errors.password = "The password must not contain the username.";
  }

  if (!errors.password && values.confirm !== values.password) {
    errors.confirm = "The passwords don't match.";
  }

  if (!values.terms) {
    errors.terms = "Please accept the terms.";
  }

  return { values, errors };
}
