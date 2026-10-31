import Layout from "../Layout";

const SOURCES = [
  { name: "Stock exchange", delay: 500 },
  { name: "News feed", delay: 1500 },
  { name: "Weather service", delay: 2500 },
  { name: "Recommendation engine", delay: 3500 },
];

/**
 * @this {import("../types").ThisContext}
 */
export default async function () {
  const start = Date.now();

  // Start all requests at once; the markup just awaits the pending promises.
  // Each result is wrapped in a loader which shows a spinner until the result is streamed in.
  const results = SOURCES.map((source) => (
    <div class="loader">
      <p aria-busy="true">Loading {source.name.toLowerCase()}...</p>
      {query(source).then((result) => (
        <Result {...result} start={start} />
      ))}
    </div>
  ));

  return (
    <Layout title="Stream HTML with Jeasx" description="Send HTML progressively to the browser.">
      <h1>Stream HTML to the browser</h1>
      <p>
        Set <code>this.jsxStream = true</code> in a route (or a guard) and the rendered markup is
        sent in chunks: whenever rendering waits for an async component, everything rendered so far
        is flushed. The browser shows the page shell right away and renders slow parts as they
        arrive. No client-side JavaScript is involved.
      </p>
      <p>
        Four slow data sources are queried in parallel. Each result is flushed as soon as it and all
        results before it are ready. <a href="">Reload</a> to watch it again.
      </p>
      {results}
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
        <small>flushed after {Date.now() - start} ms</small>
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
