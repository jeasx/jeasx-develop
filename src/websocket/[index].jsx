import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Live cursors with WebSockets"
      description="Share the cursors of all visitors in real time with a WebSocket served by a plain Jeasx route, without any dependency."
      css="/websocket/index.css"
      script="/websocket/index.js"
    >
      <h1>Live cursors with WebSockets</h1>
      <p class="lead">
        Server-Sent Events (see <a href="/sse">/sse</a>) only push from the server to the browser.{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API">WebSockets</a>{" "}
        talk both ways over one connection, which suits frequent small messages like cursor
        positions.
      </p>
      <p>
        No plugin is needed: since Node 24.9, an upgrade request reaches the normal request handler,
        so the route <code>/websocket/socket</code> takes over the connection with{" "}
        <code>reply.hijack()</code> and speaks the WebSocket protocol in about 150 lines. Open this
        page in a second window and move your mouse in the room below.
      </p>
      <section class="sx-card">
        <header>
          <h2>
            Room <small id="count" class="ws-count"></small>
          </h2>
          <span id="status" class="sx-status" data-state="connecting" role="status">
            Connecting…
          </span>
        </header>
        <div id="room" class="ws-room" aria-label="Shared room: move or click to show others">
          <p class="ws-hint">Move your pointer here · click to send a ripple</p>
        </div>
        <footer class="ws-footer">
          <small id="you">Waiting for the server…</small>
          <small id="traffic">0 sent · 0 received</small>
        </footer>
      </section>
      <p class="ws-note">
        The room lives in the memory of one server process. Serverless platforms like Vercel don't
        keep connections open, so the WebSocket only works when the server runs on its own (e.g.
        with Docker).
      </p>
    </Layout>
  );
}
