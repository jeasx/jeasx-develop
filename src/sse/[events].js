let clients = 0;

/**
 * Streams server stats as Server-Sent Events.
 */
export default function () {
  const encoder = new TextEncoder();
  let timer;

  const stream = new ReadableStream({
    start(controller) {
      clients++;
      const push = () => {
        // Skip updates while the client doesn't read, so they don't pile up in memory.
        if (controller.desiredSize <= 0) {
          return;
        }
        const data = {
          time: new Date().toLocaleTimeString("en-GB"),
          uptime: Math.round(process.uptime()),
          memory: process.memoryUsage().heapUsed,
          clients,
        };
        controller.enqueue(encoder.encode(`event: stats\ndata: ${JSON.stringify(data)}\n\n`));
      };
      push();
      timer = setInterval(push, 1000);
    },
    // Called when the client disconnects.
    cancel() {
      clearInterval(timer);
      clients--;
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
