import { createHash } from "node:crypto";

// Fixed value from RFC 6455, which proves that the server speaks WebSocket.
const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

// Stop sending to a client which doesn't read, so messages don't pile up in memory.
const MAX_BUFFERED = 64 * 1024;

/**
 * @typedef {object} Socket
 * @property {(text: string) => void} send Sends a text message (dropped while the client lags).
 * @property {(code?: number) => void} close Closes the connection.
 */

/**
 * Tells whether the browser asks to switch the connection to WebSocket.
 *
 * @param {import("fastify").FastifyRequest} request
 */
export function isUpgrade(request) {
  return (
    request.method === "GET" &&
    request.headers["upgrade"]?.toLowerCase() === "websocket" &&
    typeof request.headers["sec-websocket-key"] === "string"
  );
}

/**
 * Takes over the connection of an upgrade request and speaks a minimal WebSocket
 * (RFC 6455): unfragmented text messages, ping/pong and close. That's all a browser
 * needs for small JSON messages. Use a library like "ws" for binary data, fragmented
 * or compressed messages.
 *
 * Upgrade requests reach a Jeasx route via the "upgrade" listener in jeasx.config.js
 * (FASTIFY_SERVER), with Node and Bun alike.
 *
 * @param {import("../types").RouteProps} props
 * @param {{ onMessage?: (text: string) => void, onClose?: () => void, maxPayload?: number }} handlers
 * @returns {Socket}
 */
export function accept({ request, reply }, { onMessage, onClose, maxPayload = 4096 }) {
  // From now on Fastify leaves the connection alone, and Jeasx skips its response handling.
  reply.hijack();
  const socket = request.raw.socket;
  const key = request.headers["sec-websocket-key"];
  const acceptKey = createHash("sha1").update(`${key}${GUID}`).digest("base64");
  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "",
      "",
    ].join("\r\n"),
  );
  socket.setNoDelay(true);
  socket.setTimeout(0);

  let open = true;
  /** @type {Buffer} */
  let buffer = Buffer.alloc(0);

  /** Sends one frame; the server never masks its frames. */
  function frame(opcode, payload = Buffer.alloc(0)) {
    const length = payload.length;
    const header =
      length < 126
        ? Buffer.from([0x80 | opcode, length])
        : length < 65536
          ? Buffer.from([0x80 | opcode, 126, length >> 8, length & 0xff])
          : Buffer.concat([Buffer.from([0x80 | opcode, 127]), u64(length)]);
    socket.write(Buffer.concat([header, payload]));
  }

  function close(code = 1000) {
    if (!open) {
      return;
    }
    open = false;
    const payload = Buffer.alloc(2);
    payload.writeUInt16BE(code);
    frame(0x8, payload);
    socket.end();
    onClose?.();
  }

  /** Reads one frame from the buffer; returns false if more data is needed. */
  function readFrame() {
    if (buffer.length < 2) {
      return false;
    }
    const fin = buffer[0] & 0x80;
    const opcode = buffer[0] & 0x0f;
    const masked = buffer[1] & 0x80;
    let length = buffer[1] & 0x7f;
    let offset = 2;
    if (length === 126) {
      if (buffer.length < 4) return false;
      length = buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (buffer.length < 10) return false;
      length = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }
    if (length > maxPayload) {
      close(1009); // Message too big
      return false;
    }
    if (!masked) {
      close(1002); // Clients must mask their frames (protocol error)
      return false;
    }
    if (buffer.length < offset + 4 + length) {
      return false;
    }
    // Copy, so unmasking doesn't touch the receive buffer.
    const mask = buffer.subarray(offset, offset + 4);
    const payload = Buffer.from(buffer.subarray(offset + 4, offset + 4 + length));
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i & 3];
    }
    buffer = buffer.subarray(offset + 4 + length);

    if (!fin || opcode === 0x0 || opcode === 0x2) {
      close(1003); // Fragmented or binary messages aren't supported
      return false;
    }
    switch (opcode) {
      case 0x1:
        onMessage?.(payload.toString("utf8"));
        break;
      case 0x8:
        close(payload.length >= 2 ? payload.readUInt16BE(0) : 1000);
        break;
      case 0x9:
        frame(0xa, payload); // Answer a ping with a pong
        break;
      case 0xa:
        break;
      default:
        close(1002);
    }
    return open;
  }

  socket.on("data", (/** @type {Buffer} */ chunk) => {
    buffer = buffer.length ? Buffer.concat([buffer, chunk]) : chunk;
    while (open && readFrame());
  });
  const cleanUp = () => {
    if (open) {
      open = false;
      onClose?.();
    }
  };
  socket.on("close", cleanUp);
  socket.on("error", cleanUp);
  // The client may have left before the route ran: then "close" won't fire anymore.
  // Report it asynchronously, so the caller can finish setting up first.
  if (socket.destroyed) {
    queueMicrotask(cleanUp);
  }

  return {
    send(text) {
      if (open && socket.writableLength < MAX_BUFFERED) {
        frame(0x1, Buffer.from(text, "utf8"));
      }
    },
    close,
  };
}

function u64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(value));
  return buffer;
}
