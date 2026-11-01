// The chat room lives in the memory of this server process. With several instances
// (e.g. serverless functions or a cluster), each would have its own room: then send
// messages through a shared pub/sub system like Redis or PostgreSQL LISTEN/NOTIFY.

export const PATH = "/chat";
export const MAX_NAME_LENGTH = 24;
export const MAX_TEXT_LENGTH = 280;

const MAX_MESSAGES = 50;
const MAX_AGE = 60 * 60 * 1000;
const MAX_CLIENTS = 500;

/**
 * @typedef {{ id: number, name: string, text: string, time: string }} Message
 * @typedef {(chunk: string) => void} Client
 */

// Each route is bundled on its own, so each would get its own copy of this module.
// Keeping the state on globalThis shares it between all routes (like in the "login" example).
/** @type {{ messages: Message[], clients: Set<Client>, lastId: number }} */
const room = (globalThis.chatRoom ??= {
  messages: [],
  clients: new Set(),
  // Ids start with the current time, so they keep growing across restarts. A browser
  // reconnecting with an id from before a restart then still gets all new messages.
  lastId: Date.now(),
});
const { messages, clients } = room;

/**
 * Returns the recent messages, optionally only those newer than the given id.
 *
 * @param {number} [afterId]
 */
export function recentMessages(afterId = 0) {
  // Messages expire, so the public demo doesn't keep anything for long.
  const oldest = new Date(Date.now() - MAX_AGE).toISOString();
  while (messages.length > 0 && messages[0].time < oldest) {
    messages.shift();
  }
  return messages.filter((message) => message.id > afterId);
}

/**
 * Stores a message and sends it to all connected clients.
 *
 * @param {string} name
 * @param {string} text
 */
export function postMessage(name, text) {
  /** @type {Message} */
  const message = { id: ++room.lastId, name, text, time: new Date().toISOString() };
  messages.push(message);
  if (messages.length > MAX_MESSAGES) {
    messages.shift();
  }
  broadcast(formatEvent("message", message, message.id));
  return message;
}

/**
 * Adds a client. Returns false if the room is full.
 *
 * @param {Client} client
 */
export function join(client) {
  if (clients.size >= MAX_CLIENTS) {
    return false;
  }
  clients.add(client);
  broadcast(formatEvent("presence", { count: clients.size }));
  return true;
}

/** @param {Client} client */
export function leave(client) {
  if (clients.delete(client)) {
    broadcast(formatEvent("presence", { count: clients.size }));
  }
}

/**
 * Formats an event for Server-Sent Events. JSON has no line breaks, so it fits into one data line.
 * The id is sent back by the browser as Last-Event-ID header when it reconnects.
 *
 * @param {string} event
 * @param {unknown} data
 * @param {number} [id]
 */
export function formatEvent(event, data, id) {
  return `${id ? `id: ${id}\n` : ""}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** @param {string} chunk */
function broadcast(chunk) {
  for (const client of clients) {
    client(chunk);
  }
}
