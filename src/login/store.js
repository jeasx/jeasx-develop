import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Users and sessions live in memory, so they are lost on restart and aren't shared between
// instances (e.g. serverless functions). A real app keeps both in a database.

const scryptAsync =
  /** @type {(password: string, salt: Buffer, keylen: number) => Promise<Buffer>} */ (
    promisify(scrypt)
  );

/** Sessions end after this time without requests. */
export const SESSION_TTL = 30 * 60 * 1000;

// Limits keep a public demo from filling up the memory.
const MAX_USERS = 1000;
const MAX_SESSIONS = 10000;

// Each route is bundled on its own, so each would get its own copy of this module.
// Keeping the state on globalThis shares it between all routes (like in the "cap" example).
/**
 * @type {{
 *   users: Map<string, { email: string, salt: Buffer, hash: Buffer }>,
 *   sessions: Map<string, { username: string, expires: number }>,
 *   ready?: Promise<void>
 * }}
 */
const store = (globalThis.loginStore ??= {
  users: new Map(),
  sessions: new Map(),
});
const { users, sessions } = store;

/**
 * Derives a hash with scrypt, which is slow on purpose to make guessing passwords expensive.
 *
 * @param {string} password
 * @param {Buffer} salt
 */
function hashPassword(password, salt) {
  return scryptAsync(password.normalize("NFKC"), salt, 64);
}

// A demo account, so the login works without registering first.
const demoUser = (store.ready ??= (async () => {
  const salt = randomBytes(16);
  const hash = await hashPassword("jsx-with-ease", salt);
  users.set("demo", { email: "demo@example.com", salt, hash });
})());

// Used for unknown usernames, so the response time doesn't tell which usernames exist.
const dummySalt = randomBytes(16);
const dummyHash = hashPassword("dummy-password", dummySalt);

/** @param {string} username */
export async function userExists(username) {
  await demoUser;
  return users.has(username);
}

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<"created" | "taken" | "full">}
 */
export async function createUser(username, email, password) {
  await demoUser;
  if (users.has(username)) {
    return "taken";
  }
  if (users.size >= MAX_USERS) {
    return "full";
  }
  const salt = randomBytes(16);
  const hash = await hashPassword(password, salt);
  // Check again, as other requests could have registered while hashing.
  if (users.has(username)) {
    return "taken";
  }
  if (users.size >= MAX_USERS) {
    return "full";
  }
  users.set(username, { email, salt, hash });
  return "created";
}

/**
 * @param {string} username
 * @param {string} password
 */
export async function verifyUser(username, password) {
  await demoUser;
  const user = users.get(username);
  const hash = await hashPassword(password, user ? user.salt : dummySalt);
  const expected = user ? user.hash : await dummyHash;
  return timingSafeEqual(hash, expected) && user !== undefined;
}

/**
 * Creates a new session with an unguessable id. Always call it after login, never reuse
 * the id of an earlier session: otherwise an attacker who planted a known id in the
 * browser would be logged in as well ("session fixation").
 *
 * @param {string} username
 */
export function createSession(username) {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expires < now) {
      sessions.delete(id);
    }
  }
  // Map keeps insertion order, so the first entry is the oldest session.
  if (sessions.size >= MAX_SESSIONS) {
    sessions.delete(sessions.keys().next().value);
  }
  const id = randomBytes(32).toString("base64url");
  sessions.set(id, { username, expires: now + SESSION_TTL });
  return id;
}

/**
 * Returns the session and extends it, or undefined if it is unknown or expired.
 *
 * @param {string | undefined} id
 */
export function getSession(id) {
  const session = id ? sessions.get(id) : undefined;
  if (!session) {
    return undefined;
  }
  if (session.expires < Date.now()) {
    sessions.delete(id);
    return undefined;
  }
  session.expires = Date.now() + SESSION_TTL;
  const user = users.get(session.username);
  return {
    id,
    username: session.username,
    email: user?.email ?? "",
    expires: session.expires,
  };
}

/** @param {string | undefined} id */
export function deleteSession(id) {
  if (id) {
    sessions.delete(id);
  }
}
