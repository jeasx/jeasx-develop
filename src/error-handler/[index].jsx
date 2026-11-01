import { html, jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

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
    >
      <h1>Catch errors at runtime</h1>
      <p>
        Jeasx streams markup by default. Errors that happen before the first chunk is sent are
        handled by Fastify's error handler, which answers with the right status code. By default, it
        responds with JSON; register your own via <code>setErrorHandler()</code> in{" "}
        <code>FASTIFY_SERVER</code> of <code>jeasx.config.js</code> to render a user-friendly error
        page. Once streaming has started, status and headers are already sent: wrap risky components
        in an error boundary to render a fallback instead. Have a look at the source to see how
        things are wired up.
      </p>
      <ul>
        <li>
          <a href={`${request.path}?error=before`}>Error before streaming</a> → Fastify's error
          handler
        </li>
        <li>
          <a href={`${request.path}?error=caught`}>Error while streaming, caught</a> → fallback
          content
        </li>
        <li>
          <a href={`${request.path}?error=uncaught`}>Error while streaming, uncaught</a> → truncated
          page
        </li>
      </ul>
      {error === "caught" && (
        <ErrorBoundary
          fallback={<p class="alert alert-error">This section could not be loaded.</p>}
        >
          <ComponentWithError />
        </ErrorBoundary>
      )}
      {error === "uncaught" && <ComponentWithError />}
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
