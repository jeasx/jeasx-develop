import Layout from "../Layout";

const USERS = ["Ada", "Grace", "Linus"];
const DELAY = 1000;

/** Time span of the waterfall in ms: long enough for the sequential mode. */
const SCALE = USERS.length * DELAY + 300;

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const mode = request.query["mode"] === "parallel" ? "parallel" : "sequential";
  const start = Date.now();

  return (
    <Layout
      title="Load data in parallel with async components"
      description="Async JSX components render in order; start promises early to load data in parallel."
      css="/parallel/index.css"
    >
      <div class="sx">
        <h1>Load data in parallel with async components</h1>
        <p>
          Components in Jeasx can be <code>async</code> and simply <code>await</code> their data.
          The renderer resolves them one after another, so three components that each wait one
          second take three seconds in total.
        </p>
        <p>
          As JSX also accepts promises as children, you can kick off all requests up front and hand
          the pending promises to your markup. Now everything loads at the same time while the
          output order stays the same. The bars below show when each request started and finished.
        </p>
        <nav class="sx-toggle" aria-label="Loading mode">
          <a href="?mode=sequential" aria-current={mode === "sequential" ? "page" : undefined}>
            Sequential
          </a>
          <a href="?mode=parallel" aria-current={mode === "parallel" ? "page" : undefined}>
            Parallel
          </a>
        </nav>
        <section class="sx-card">
          <header>
            <h2>Requests</h2>
            <small>{mode}</small>
          </header>
          <div class="px-axis" aria-hidden="true">
            <span>0 s</span>
            <span>1 s</span>
            <span>2 s</span>
            <span>3 s</span>
          </div>
          {mode === "sequential" ? <Sequential start={start} /> : <Parallel start={start} />}
        </section>
        <Elapsed start={start} />
      </div>
    </Layout>
  );
}

/** Each component fetches its own data when it is rendered. */
function Sequential({ start }) {
  return USERS.map((name) => (
    <Loader name={name}>
      <User name={name} start={start} />
    </Loader>
  ));
}

/** All requests are started immediately, the markup just awaits the promises. */
function Parallel({ start }) {
  const users = USERS.map(async (name) => <Row {...await loadUser(name, start)} />);
  return users.map((user, index) => <Loader name={USERS[index]}>{user}</Loader>);
}

async function User({ name, start }) {
  return <Row {...await loadUser(name, start)} />;
}

/** Shows a placeholder until the children are streamed in after it. */
function Loader({ name, children }) {
  return (
    <div class="loader">
      <p class="sx-pending" aria-busy="true">
        Waiting for {name}...
      </p>
      {children}
    </div>
  );
}

function Row({ name, startedAt, loadedAt }) {
  return (
    <article class="sx-result">
      <strong>{name}</strong>{" "}
      <small>
        requested at +{startedAt} ms, loaded at +{loadedAt} ms
      </small>
      <div
        class="sx-bar"
        style={`--from: ${(startedAt / SCALE).toFixed(3)}; --to: ${(loadedAt / SCALE).toFixed(3)}`}
      ></div>
    </article>
  );
}

/**
 * Elapsed time is computed when this component is rendered,
 * i.e. after all previous siblings are resolved.
 */
function Elapsed({ start }) {
  return <output class="sx-done">Rendered in {Date.now() - start} ms</output>;
}

/** Simulates a slow API call. */
async function loadUser(name, start) {
  const startedAt = Date.now() - start;
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  return { name, startedAt, loadedAt: Date.now() - start };
}
