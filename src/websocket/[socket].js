import { accept, isUpgrade } from "./websocket";

const MAX_CLIENTS = 200;
const MIN_INTERVAL = 25; // milliseconds between two messages of a client
const COLORS = ["#22d3ee", "#a855f7", "#f472b6", "#facc15", "#4ade80", "#fb923c", "#60a5fa"];
const NAMES = ["Otter", "Lynx", "Heron", "Panda", "Gecko", "Koala", "Bison", "Raven", "Moose"];

/**
 * @typedef {{ id: number, name: string, color: string, x: number, y: number,
 *   send: (text: string) => void, last: number }} Client
 */

// Each route is bundled on its own; globalThis keeps the room across reloads in development.
/** @type {{ clients: Map<number, Client>, lastId: number }} */
const room = (globalThis.websocketRoom ??= { clients: new Map(), lastId: 0 });

/**
 * Upgrades the request to a WebSocket and shares the cursors of all visitors.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (!isUpgrade(request)) {
    reply.header("upgrade", "websocket");
    return new Response("This route only speaks WebSocket.", {
      status: 426,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (room.clients.size >= MAX_CLIENTS) {
    return new Response("The room is full.", { status: 503 });
  }

  const id = ++room.lastId;
  /** @type {Client} */
  const client = {
    id,
    name: NAMES[id % NAMES.length],
    color: COLORS[id % COLORS.length],
    x: -1,
    y: -1,
    last: 0,
    send: () => {},
  };

  const socket = accept(
    { request, reply },
    {
      maxPayload: 256,
      onMessage(text) {
        // Ignore clients which send too fast.
        const now = Date.now();
        if (now - client.last < MIN_INTERVAL) {
          return;
        }
        client.last = now;
        let message;
        try {
          message = JSON.parse(text);
        } catch {
          return;
        }
        if (message?.type === "hide") {
          client.x = client.y = -1;
          broadcast({ type: "move", id, x: -1, y: -1 }, client);
          return;
        }
        const x = clamp(message?.x);
        const y = clamp(message?.y);
        if (x === null || y === null) {
          return;
        }
        if (message.type === "move") {
          client.x = x;
          client.y = y;
          broadcast({ type: "move", id, x, y }, client);
        } else if (message.type === "click") {
          broadcast({ type: "click", id, x, y });
        }
      },
      onClose() {
        room.clients.delete(id);
        broadcast({ type: "leave", id, count: room.clients.size });
      },
    },
  );
  client.send = socket.send;

  // Introduce the new client to everyone, and everyone to the new client.
  const peers = [...room.clients.values()].map(info);
  room.clients.set(id, client);
  socket.send(JSON.stringify({ type: "welcome", you: info(client), peers }));
  broadcast({ type: "join", peer: info(client), count: room.clients.size }, client);
}

/**
 * @param {object} message
 * @param {Client} [except]
 */
function broadcast(message, except) {
  const text = JSON.stringify(message);
  for (const client of room.clients.values()) {
    if (client !== except) {
      client.send(text);
    }
  }
}

/** @param {Client} client */
function info({ id, name, color, x, y }) {
  return { id, name, color, x, y };
}

/** Accepts a fraction between 0 and 1, rounded to keep messages small. */
function clamp(value) {
  return typeof value === "number" && value >= 0 && value <= 1
    ? Math.round(value * 1000) / 1000
    : null;
}
