import Layout from "../Layout";
import { ErrorBoundary } from "./ErrorBoundary";
import Parallel from "./Parallel";
import { Comments, Elapsed, Failed, News, Recommendations, Stocks, Weather } from "./widgets";

const SCENARIOS = [
  {
    id: "before",
    title: "Error before streaming",
    description:
      "The route throws before it returns any markup. Nothing is sent yet, so Fastify's error handler answers with status 500.",
    result: "Fastify's error handler",
  },
  {
    id: "caught",
    title: "Error while streaming, caught",
    description:
      "A component fails after the page has started streaming. An error boundary catches it and renders a fallback instead.",
    result: "Fallback content",
  },
  {
    id: "uncaught",
    title: "Error while streaming, uncaught",
    description:
      "The same component without a boundary. Status and headers are already sent, so the page simply ends where the error happened.",
    result: "Truncated page",
  },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default async function (props) {
  const { request } = props;
  const error = request.query["error"];

  // Errors before the response is returned reach Fastify's error handler.
  if (error === "before") {
    throw new Error("Something went wrong before rendering.");
  }

  const start = Date.now();
  const log =
    (/** @type {string} */ widget) =>
    (/** @type {any} */ { error, attempts }) =>
      request.log.warn(`${widget}: attempt ${attempts} failed: ${error?.message ?? error}`);
  const tries = { count: 0 };

  return (
    <Layout
      title="Catch errors at runtime"
      description="Catch errors at runtime: Fastify's error handler before streaming, error boundaries with fallbacks, retries and timeouts while the page streams on."
      css="/error-handler/index.css"
    >
      <h1>Catch errors at runtime</h1>
      <p class="lead">
        Jeasx streams markup by default. Errors that happen before the first chunk is sent are
        handled by Fastify's error handler, which answers with the right status code.
      </p>
      <p>
        By default, it responds with JSON; register your own via <code>setErrorHandler()</code> in{" "}
        <code>FASTIFY_SERVER</code> of <code>jeasx.config.js</code> to render a user-friendly error
        page. Once streaming has started, status and headers are already sent: wrap risky components
        in an error boundary to render a fallback instead. Pick a scenario below and have a look at
        the source to see how things are wired up.
      </p>

      <div class="scenarios">
        {SCENARIOS.map(({ id, title, description, result }) => (
          <article class={id === error ? "scenario scenario-active" : "scenario"}>
            <header>
              <strong>{title}</strong>
            </header>
            <p>
              <small>{description}</small>
            </p>
            <footer>
              <a href={`?error=${id}`} role="button" aria-current={id === error ? "true" : "false"}>
                Try it
              </a>
              <span class="scenario-result">→ {result}</span>
            </footer>
          </article>
        ))}
      </div>

      {error === "uncaught" ? (
        <section class="output">
          <h2>Output</h2>
          <Comments />
        </section>
      ) : (
        <>
          {error === "caught" && (
            <section class="output">
              <h2>Output</h2>
              <ErrorBoundary
                fallback={<p class="alert alert-error">This section couldn't be loaded.</p>}
              >
                <Comments />
              </ErrorBoundary>
              <p>
                <a href="?">Reset</a>
              </p>
            </section>
          )}

          <h2>How the error boundary works</h2>
          <p>
            <code>ErrorBoundary.jsx</code> renders its children to a string first with{" "}
            <code>jsxToString</code>, so it can catch what goes wrong and render a fallback instead.
            Since JSX elements are only descriptions, it can also render them <em>again</em> to
            retry, and give up on slow ones after a timeout. It passes <code>this.signal</code> to
            its children, which aborts on timeout, so components stop waiting for data nobody needs
            anymore.
          </p>

          <h3>A dashboard which never breaks</h3>
          <p>
            Async components render one after another, so four boundaries would wait for each other.{" "}
            <code>&lt;Parallel&gt;</code> starts all its children at once and streams them in order.{" "}
            <a href="">Reload</a> to run it again.
          </p>
          <div class="eb-grid">
            <Parallel>
              <ErrorBoundary fallback={<Failed title="Weather" />}>
                <Weather />
              </ErrorBoundary>
              <ErrorBoundary
                onError={log("Stocks")}
                fallback={({ error }) => (
                  <Failed
                    title="Stocks"
                    reason={error instanceof Error ? error.message : String(error)}
                  />
                )}
              >
                <Stocks />
              </ErrorBoundary>
              <ErrorBoundary
                timeout={800}
                onError={log("Recommendations")}
                fallback={({ timedOut }) => (
                  <Failed
                    title="Recommendations"
                    reason={timedOut ? "Took longer than 800 ms." : ""}
                  />
                )}
              >
                <Recommendations />
              </ErrorBoundary>
              <ErrorBoundary
                retries={3}
                onError={log("News")}
                fallback={({ attempts }) => (
                  <Failed title="News" reason={`Gave up after ${attempts} attempts.`} />
                )}
              >
                <News tries={tries} />
              </ErrorBoundary>
            </Parallel>
          </div>
          <p class="eb-elapsed">
            <Elapsed start={start} /> for all four widgets: they loaded in parallel, and the slow
            one was cut off after 800 ms.
          </p>

          <h3>Nested boundaries</h3>
          <p>
            The inner boundary catches the failing comments, so the article around them still shows.
            A failure the inner boundary doesn't catch would end up in the outer one.
          </p>
          <ErrorBoundary fallback={<Failed title="Article" />}>
            <article>
              <header>
                <strong>Why HTML first?</strong>
              </header>
              <p>Because the fastest JavaScript is the one you don't send.</p>
              <ErrorBoundary fallback={<p class="eb-muted">Comments are unavailable right now.</p>}>
                <Comments />
              </ErrorBoundary>
            </article>
          </ErrorBoundary>
        </>
      )}
    </Layout>
  );
}
