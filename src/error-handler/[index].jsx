import { html, jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

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
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const error = request.query["error"];

  // Errors before the response is returned reach Fastify's error handler.
  if (error === "before") {
    throw new Error("Something went wrong before rendering.");
  }

  return (
    <Layout
      title="Catch errors at runtime"
      description="Catch errors at runtime and render fallback content instead of a broken page."
      css="/error-handler/index.css"
    >
      <h1>Catch errors at runtime</h1>
      <p>
        Jeasx streams markup by default. Errors that happen before the first chunk is sent are
        handled by Fastify's error handler, which answers with the right status code. By default, it
        responds with JSON; register your own via <code>setErrorHandler()</code> in{" "}
        <code>FASTIFY_SERVER</code> of <code>jeasx.config.js</code> to render a user-friendly error
        page.
      </p>
      <p>
        Once streaming has started, status and headers are already sent: wrap risky components in an
        error boundary to render a fallback instead. Pick a scenario below and have a look at the
        source to see how things are wired up.
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

      {error && (
        <section class="output">
          <h2>Output</h2>
          {error === "caught" && (
            <ErrorBoundary
              fallback={<p class="alert alert-error">This section couldn't be loaded.</p>}
            >
              <ComponentWithError />
            </ErrorBoundary>
          )}
          {error === "uncaught" && <ComponentWithError />}
          <p>
            <a href="?">Reset</a>
          </p>
        </section>
      )}
    </Layout>
  );
}

/**
 * Renders children to a string, so errors can be caught here and replaced by a fallback.
 * The string is wrapped in html(), as strings returned by components are escaped.
 * @this {import("../types").ThisContext}
 */
async function ErrorBoundary({ fallback, children }) {
  try {
    return html(await jsxToString.call(this, children));
  } catch (error) {
    this.request.log.error(error);
    return fallback;
  }
}

/** @returns {Promise<JSX.Element>} */
async function ComponentWithError() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  throw new Error("Something went wrong while rendering this component.");
}
