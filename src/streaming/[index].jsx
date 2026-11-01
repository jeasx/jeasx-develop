import Layout from "../Layout";

const SOURCES = [
  { name: "Stock exchange", delay: 500 },
  { name: "News feed", delay: 1000 },
  { name: "Weather service", delay: 1500 },
];

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
    >
      <h1>Streaming vs. string rendering</h1>
      <p>
        Jeasx streams JSX by default: the page shell is flushed immediately and slow parts follow as
        soon as they are ready. In v2, the complete markup was rendered to a string first and sent
        in one go.
      </p>
      <p>
        Open the network tab of your browser's developer tools and reload the page in both modes.
        When streaming, the first byte arrives almost instantly, while the download keeps going
        until the last result is sent. When rendering to a string, the time to first byte equals the
        time of the slowest result, and the complete document arrives in one go.
      </p>
      <p>
        The guard of this example shows how to restore the former string rendering in userland: it
        wraps <code>this.jsxToString</code> and calls <code>jsxToString</code> from{" "}
        <code>jsx-async-runtime</code> when a route sets <code>this.jsxStream = false</code>.
      </p>
      <div class="row center">
        <a href="?stream=true" role="button" aria-disabled={this.jsxStream ? "true" : "false"}>
          Streaming
        </a>
        &nbsp;
        <a href="?stream=false" role="button" aria-disabled={this.jsxStream ? "false" : "true"}>
          String
        </a>
      </div>
      <p>
        Current mode: <strong>{this.jsxStream ? "streaming" : "string"}</strong>.{" "}
        {this.jsxStream
          ? "Watch the results appear one after another."
          : "The browser shows nothing until every result is ready."}
      </p>
      {SOURCES.map((source) => (
        <div class="loader">
          <p aria-busy="true">Loading {source.name.toLowerCase()}...</p>
          {query(source).then((result) => (
            <Result {...result} start={start} />
          ))}
        </div>
      ))}
      <Done start={start} />
    </Layout>
  );
}

function Result({ name, value, start }) {
  return (
    <article>
      <header>
        <strong>{name}</strong>
      </header>
      <p>{value}</p>
      <footer>
        <small>rendered after {Date.now() - start} ms</small>
      </footer>
    </article>
  );
}

function Done({ start }) {
  return (
    <p class="center">
      <strong>All done after {Date.now() - start} ms.</strong>
    </p>
  );
}

/** Simulates a slow backend call. */
async function query({ name, delay }) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return { name, value: `Result from ${name.toLowerCase()} (took ${delay} ms)` };
}
