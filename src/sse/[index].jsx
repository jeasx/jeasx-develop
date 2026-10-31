import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Server-Sent Events with Jeasx"
      description="Push live updates from the server by returning a Response with a ReadableStream."
      script="/sse/index.js"
    >
      <h1>Push live updates with Server-Sent Events</h1>
      <p>
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events">
          Server-Sent Events
        </a>{" "}
        keep a single HTTP connection open, so the server can push updates whenever it wants. In
        Jeasx a route simply returns a standard <code>Response</code> wrapping a{" "}
        <code>ReadableStream</code>. When the browser goes away, the stream is cancelled and the
        timer is cleaned up.
      </p>
      <p>
        The values below are pushed by the server every second and rendered by a few lines of
        vanilla JavaScript using <code>EventSource</code>.
      </p>
      <div class="row center">
        <Stat id="time" label="Server time" />
        <Stat id="uptime" label="Uptime" />
        <Stat id="memory" label="Heap used" />
        <Stat id="clients" label="Connected clients" />
      </div>
      <p class="center">
        <small id="status">Connecting…</small>
      </p>
    </Layout>
  );
}

function Stat({ id, label }) {
  return (
    <article class="col-12 col-md-3">
      <header>{label}</header>
      <h2 id={id}>–</h2>
    </article>
  );
}
