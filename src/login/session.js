import { createSession, deleteSession } from "./store";

export const PATH = "/login";

/**
 * Logs the user in with a new session and sets its cookie.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {string} username
 */
export function startSession(reply, username) {
  // Without maxAge the browser drops the cookie when it closes. The server ends
  // sessions after 30 minutes without requests anyway (see store.js).
  // httpOnly (set in jeasx.config.js) keeps scripts from reading the id,
  // sameSite "strict" keeps other sites from sending it along.
  reply.setCookie("session", createSession(username), {
    path: PATH,
    signed: true,
  });
}

/**
 * Ends the session on the server and removes its cookie.
 *
 * @param {import("fastify").FastifyReply} reply
 * @param {string | undefined} id
 */
export function endSession(reply, id) {
  deleteSession(id);
  reply.clearCookie("session", { path: PATH });
}
