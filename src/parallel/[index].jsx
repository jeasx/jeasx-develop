import Layout from "../Layout";

const DELAY = 1000;

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  this.jsxStream = true;

  const mode = request.query["mode"] === "parallel" ? "parallel" : "sequential";
  const start = Date.now();

  return (
    <Layout
      title="Load data in parallel with async components"
      description="Async JSX components render in order; start promises early to load data in parallel."
    >
      <h1>Load data in parallel with async components</h1>
      <p>
        Components in Jeasx can be <code>async</code> and simply <code>await</code> their data. The
        renderer resolves them one after another, so three components that each wait one second take
        three seconds in total.
      </p>
      <p>
        As JSX also accepts promises as children, you can kick off all requests up front and hand
        the pending promises to your markup. Now everything loads at the same time while the output
        order stays the same.
      </p>
      <div class="row center">
        <a href="?mode=sequential" role="button" aria-disabled={String(mode === "sequential")}>
          Sequential
        </a>
        &nbsp;
        <a href="?mode=parallel" role="button" aria-disabled={String(mode === "parallel")}>
          Parallel
        </a>
      </div>
      <hr />
      {mode === "sequential" ? <Sequential start={start} /> : <Parallel start={start} />}
      <Elapsed start={start} />
    </Layout>
  );
}

/** Each component fetches its own data when it is rendered. */
function Sequential({ start }) {
  return (
    <div class="row">
      {[1, 2, 3].map((id) => (
        <Loader>
          <User id={id} start={start} />
        </Loader>
      ))}
    </div>
  );
}

/** All requests are started immediately, the markup just awaits the promises. */
function Parallel({ start }) {
  const users = [1, 2, 3].map(async (id) => <Card {...await loadUser(id, start)} />);
  return (
    <div class="row">
      {users.map((user) => (
        <Loader>{user}</Loader>
      ))}
    </div>
  );
}

async function User({ id, start }) {
  return <Card {...await loadUser(id, start)} />;
}

/** Shows a spinner until the children are streamed in after it. */
function Loader({ children }) {
  return (
    <div class="loader col-12 col-md-4">
      <p aria-busy="true" class="center">
        Loading...
      </p>
      {children}
    </div>
  );
}

function Card({ name, loadedAt }) {
  return (
    <article class="center">
      <header>
        <strong>{name}</strong>
      </header>
      <small>loaded at +{loadedAt} ms</small>
    </article>
  );
}

/**
 * Elapsed time is computed when this component is rendered,
 * i.e. after all previous siblings are resolved.
 */
function Elapsed({ start }) {
  return (
    <p class="center">
      <strong>Rendered in {Date.now() - start} ms</strong>
    </p>
  );
}

/** Simulates a slow API call. */
async function loadUser(id, start) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  return {
    name: ["Ada", "Grace", "Linus"][id - 1],
    loadedAt: Date.now() - start,
  };
}
