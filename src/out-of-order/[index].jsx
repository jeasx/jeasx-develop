import Layout from "../Layout";

/** Time span of the bars in ms, a bit longer than the slowest possible delay. */
const SCALE = 2100;

const SOURCES = [
  { id: "weather", name: "Weather service" },
  { id: "news", name: "News feed" },
  { id: "stocks", name: "Stock exchange" },
];

/**
 * @this {import("../types").ThisContext}
 */
export default function () {
  const start = Date.now();

  // Start all requests right away. Failures become a result of their own,
  // so one broken source doesn't break the page.
  const results = SOURCES.map((source) =>
    query(source).then(
      (value) => ({ ...source, value, time: Date.now() - start }),
      () => ({
        ...source,
        value: "Couldn't be loaded.",
        time: Date.now() - start,
      }),
    ),
  );

  return (
    <Layout
      title="Out-of-order streaming"
      description="Stream slow parts of a page in the order they finish, while they still appear in their place."
      css="/out-of-order/index.css"
    >
      <div class="sx">
        <h1>Out-of-order streaming</h1>
        <p>
          Jeasx streams markup in order, so a slow component holds back
          everything after it (see <a href="/streaming">Streaming HTML</a>).
          Here, the results show up in the order they finish and still appear in
          their place on the page.
        </p>
        <p>
          This works without client-side JavaScript, thanks to{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template#shadowrootmode">
            Declarative Shadow DOM
          </a>
          : the container is sent first, with a <code>&lt;slot&gt;</code> for
          each source and a loading indicator inside it. An async generator then
          streams each result as soon as it's ready, marked with{" "}
          <code>slot="…"</code>, and the browser moves it into the matching
          slot.
        </p>
        <p class="center">
          <a class="sx-button" href="">
            Reload with new delays
          </a>
        </p>
        {/* µCSS styles a shadow host without data-theme as light, so repeat the theme of the page. */}
        <div data-theme="dark">
          <template shadowrootmode="open">
            {/* Page styles don't reach into a shadow root, so it links them itself. */}
            <link
              rel="stylesheet"
              href={`/index.css?v=${process.env.BUILD_ID}`}
            />
            <link
              rel="stylesheet"
              href={`/out-of-order/index.css?v=${process.env.BUILD_ID}`}
            />
            <div class="oo-grid">
              {SOURCES.map(({ id, name }) => (
                <slot name={id}>
                  <p class="sx-pending" aria-busy="true">
                    Loading {name.toLowerCase()}...
                  </p>
                </slot>
              ))}
            </div>
          </template>
          <InOrderOfCompletion results={results} />
        </div>
        <Done start={start} />
      </div>
    </Layout>
  );
}

/**
 * Yields one card per result as soon as it is ready, no matter where it sits on the page.
 *
 * @param {{ results: Promise<{ id: string, name: string, value: string, time: number }>[] }} props
 */
async function* InOrderOfCompletion({ results }) {
  const pending = new Map(
    results.map((result, index) => [
      index,
      result.then((r) => /** @type {const} */ ([index, r])),
    ]),
  );
  let position = 0;
  while (pending.size > 0) {
    const [index, { id, name, value, time }] = await Promise.race(
      pending.values(),
    );
    pending.delete(index);
    position++;
    yield (
      <article slot={id} class="sx-result">
        <span class="oo-rank" title="Order of arrival">
          #{position}
        </span>
        <strong>{name}</strong>
        <p>{value}</p>
        <small>arrived after {time} ms</small>
        <div
          class="sx-bar"
          style={`--to: ${Math.min(time / SCALE, 1).toFixed(3)}`}
        ></div>
      </article>
    );
  }
}

/** Rendered after all results are streamed. */
function Done({ start }) {
  return (
    <output class="sx-done">All done after {Date.now() - start} ms</output>
  );
}

/** Simulates a slow backend call with a random delay. */
async function query({ name }) {
  const delay = 300 + Math.floor(Math.random() * 1700);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return `Result from ${name.toLowerCase()} (took ${delay} ms)`;
}
