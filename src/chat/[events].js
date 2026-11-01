import { formatEvent, join, leave, recentMessages } from "./room";

/**
 * Streams new chat messages and the number of people online as Server-Sent Events.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // On reconnect, the browser sends the id of the last message it received. The first
  // connection passes the id of the last message the page was rendered with instead.
  const afterId = Number(request.headers["last-event-id"] ?? request.query["after"]) || 0;

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream(
    {
      start(controller) {
        /** @type {import("./room").Client} */
        const client = (chunk) => {
          // A client which doesn't keep up is disconnected instead of filling the memory.
          // Its browser reconnects and catches up via Last-Event-ID.
          try {
            if (controller.desiredSize <= 0) {
              cleanup();
              controller.close();
              return;
            }
            controller.enqueue(encoder.encode(chunk));
          } catch {
            // The stream is already closed: don't let it break the broadcast to the others.
            cleanup();
          }
        };

        if (!join(client)) {
          controller.enqueue(encoder.encode(formatEvent("full", {})));
          controller.close();
          return;
        }

        // Comments keep proxies from closing an idle connection.
        const heartbeat = setInterval(() => client(": ping\n\n"), 20_000);
        cleanup = () => {
          clearInterval(heartbeat);
          leave(client);
          cleanup = () => {};
        };

        // Reconnect after 3 seconds if the connection drops, then send what was missed.
        controller.enqueue(encoder.encode("retry: 3000\n\n"));
        for (const message of recentMessages(afterId)) {
          client(formatEvent("message", message, message.id));
        }
      },
      // Called when the browser disconnects.
      cancel() {
        cleanup();
      },
    },
    // Up to 100 events may wait for a slow client before it is disconnected.
    new CountQueuingStrategy({ highWaterMark: 100 }),
  );

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
