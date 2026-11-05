import Layout from "../Layout";

const SOURCES = [
  { name: "Stock exchange", delay: 500 },
  { name: "News feed", delay: 1000 },
  { name: "Weather service", delay: 1500 },
];

/** Time span of the bars in ms, a bit longer than the slowest source. */
const SCALE = 1800;

/**
 * @this {import("../types").ThisContext & { jsxStream?: boolean }}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  this.jsxStream = request.query["stream"] !== "false";

  const start = Date.now();

  return (
    <Layout
      title="Streaming vs. string rendering"
      description="Compare streamed JSX with JSX rendered to a string."
      css="/streaming/index.css"
      script="/streaming/index.js"
    >
      <div class="sx">
        <h1>Streaming vs. string rendering</h1>
        <p>
          Jeasx streams JSX by default: the page shell is flushed immediately and slow parts follow
          as soon as they are ready. In v2, the complete markup was rendered to a string first and
          sent in one go.
        </p>
        <p>
          Switch between both modes and compare the numbers below. When streaming, the first byte
          arrives almost instantly and the results appear one after another. When rendering to a
          string, the browser waits for the slowest result before it receives anything at all.
        </p>
        <p>
          The guard of this example shows how to restore the former string rendering in userland: it
          wraps <code>this.jsxToString</code> and calls <code>jsxToString</code> from{" "}
          <code>jsx-async-runtime</code> when a route sets <code>this.jsxStream = false</code>.
        </p>
        <nav class="sx-toggle" aria-label="Rendering mode">
          <a href="?stream=true" aria-current={this.jsxStream ? "page" : undefined}>
            Streaming
          </a>
          <a href="?stream=false" aria-current={this.jsxStream ? undefined : "page"}>
            String
          </a>
        </nav>
        <section class="sx-card">
          <header>
            <h2>Slow sources</h2>
            <small>rendered on the server</small>
          </header>
          {SOURCES.map((source) => (
            <div class="loader">
              <p class="sx-pending" aria-busy="true">
                Loading {source.name.toLowerCase()}...
              </p>
              {query(source).then((result) => (
                <Result {...result} start={start} />
              ))}
            </div>
          ))}
        </section>
        <Done start={start} />
        <section class="sx-card">
          <header>
            <h2>Measured by your browser</h2>
            <small>{this.jsxStream ? "streaming" : "string"} mode</small>
          </header>
          <dl class="sx-metrics">
            <div>
              <dt>First byte</dt>
              <dd id="ttfb">…</dd>
            </div>
            <div>
              <dt>Complete page</dt>
              <dd id="complete">…</dd>
            </div>
          </dl>
        </section>
      </div>
    </Layout>
  );
}

function Result({ name, value, start }) {
  const time = Date.now() - start;
  return (
    <article class="sx-result">
      <strong>{name}</strong>
      <p>{value}</p>
      <small>rendered after {time} ms</small>
      <div class="sx-bar" style={`--to: ${Math.min(time / SCALE, 1).toFixed(3)}`}></div>
    </article>
  );
}

function Done({ start }) {
  return <output class="sx-done">All done after {Date.now() - start} ms</output>;
}

/** Simulates a slow backend call. */
async function query({ name, delay }) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return {
    name,
    value: `Result from ${name.toLowerCase()} (took ${delay} ms)`,
  };
}
