// The team directory: what can be edited, how it's validated and where it's stored.
// Contacts live in a signed cookie, so every visitor edits their own copy.
import { readListCookie, writeListCookie } from "../@helpers/cookies";

/**
 * @typedef {{ id: string, name: string, role: string, email: string, phone: string,
 *   hue: number }} Contact
 * @typedef {Record<string, string>} Errors field name → message
 */

export const FIELDS = [
  { name: "name", label: "Name", type: "text", autocomplete: "name" },
  { name: "role", label: "Role", type: "text", autocomplete: "organization-title" },
  { name: "email", label: "Email", type: "email", autocomplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autocomplete: "tel" },
];

/** @type {Contact[]} */
export const DEFAULTS = [
  {
    id: "ada",
    name: "Ada Lovelace",
    role: "Analyst",
    email: "ada@example.com",
    phone: "+44 20 7946 0018",
    hue: 320,
  },
  {
    id: "grace",
    name: "Grace Hopper",
    role: "Compiler engineer",
    email: "grace@example.com",
    phone: "+1 202 555 0143",
    hue: 200,
  },
  {
    id: "alan",
    name: "Alan Turing",
    role: "Codebreaker",
    email: "alan@example.com",
    phone: "+44 161 496 0754",
    hue: 140,
  },
  {
    id: "margaret",
    name: "Margaret Hamilton",
    role: "Flight software lead",
    email: "margaret@example.com",
    phone: "+1 617 555 0199",
    hue: 40,
  },
];

const COOKIE = "contacts";
const PATH = "/htmx";
const MAX_LENGTH = 60;

/**
 * The stored contacts. Only known ids are accepted, and values are cut to their maximum
 * length, as the cookie could hold a signed value of another example.
 *
 * @param {import("fastify").FastifyRequest} request
 * @returns {Contact[]}
 */
export function loadContacts(request) {
  const stored = readListCookie(request, COOKIE) ?? [];
  return DEFAULTS.map((contact) => {
    const saved = stored.find((item) => item.id === contact.id);
    return saved ? { ...contact, ...pick(saved) } : contact;
  });
}

/**
 * @param {import("fastify").FastifyReply} reply
 * @param {Contact[]} contacts
 */
export function saveContacts(reply, contacts) {
  writeListCookie(
    reply,
    COOKIE,
    contacts.map(({ id, name, role, email, phone }) => ({ id, name, role, email, phone })),
    PATH,
  );
}

/** @param {import("fastify").FastifyReply} reply */
export function resetContacts(reply) {
  reply.clearCookie(COOKIE, { path: PATH });
}

/**
 * Keeps the editable fields of a submitted form, trimmed and cut to their maximum length.
 *
 * @param {unknown} body
 * @returns {Record<string, string>}
 */
export function pick(body) {
  /** @type {Record<string, string>} */
  const values = {};
  const source = body && typeof body === "object" ? body : {};
  for (const { name } of FIELDS) {
    const value = source[name];
    values[name] = typeof value === "string" ? value.trim().slice(0, MAX_LENGTH) : "";
  }
  return values;
}

/**
 * @param {Record<string, string>} values
 * @returns {Errors}
 */
export function validate(values) {
  /** @type {Errors} */
  const errors = {};
  if (!values.name) {
    errors.name = "Enter a name.";
  }
  if (!values.role) {
    errors.role = "Enter a role.";
  }
  if (!/^[^\s@]{1,64}@[^\s@.]{1,63}(\.[^\s@.]{1,63})+$/.test(values.email)) {
    errors.email = "Enter an email like ada@example.com.";
  }
  // A single character class keeps the check fast for any input.
  if (values.phone && !/^\+?[\d ()/.-]{6,19}\d$/.test(values.phone)) {
    errors.phone = "Enter a phone number like +44 20 7946 0018.";
  }
  return errors;
}
