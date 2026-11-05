import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Push live updates with Server-Sent Events"
      description="Push live updates from the server by returning a Response with a ReadableStream."
      css="/sse/index.css"
      script="/sse/index.js"
    >
      <div class="sx">
        <h1>Push live updates with Server-Sent Events</h1>
        <p>
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events">
            Server-Sent Events
          </a>{" "}
          keep a single HTTP connection open, so the server can push updates whenever it wants. In
          Jeasx a route simply returns a standard <code>Response</code> wrapping a{" "}
          <code>ReadableStream</code>.
        </p>
        <p>
          The values below are pushed by the server every second and rendered by a few lines of
          vanilla JavaScript using <code>EventSource</code>. Disconnect to see the stream being
          cancelled on the server: its timer is cleaned up and the client counter goes down in all
          other open windows.
        </p>
        <section class="sx-card">
          <header>
            <h2>Server stats</h2>
            <span id="status" class="sx-status" data-state="connecting" role="status">
              Connecting…
            </span>
          </header>
          <dl class="se-tiles">
            <Stat id="time" label="Server time" />
            <Stat id="uptime" label="Uptime" />
            <Stat id="memory" label="Heap used">
              <svg
                class="se-sparkline"
                viewBox="0 0 59 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline id="memory-history" points="" />
              </svg>
            </Stat>
            <Stat id="clients" label="Clients on this server" />
          </dl>
          <footer class="se-footer">
            <small id="received">No events received yet.</small>
            <button id="toggle" type="button">
              Disconnect
            </button>
          </footer>
        </section>
      </div>
    </Layout>
  );
}

function Stat({ id, label, children = undefined }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd id={id}>–</dd>
      {children}
    </div>
  );
}
