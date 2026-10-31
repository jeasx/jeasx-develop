import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  if (request.query["errorHandler"] === "true") {
    this.errorHandler = async (error) => {
      // You can decide if you want to create a log entry.
      // console.error("❌", error);
      return (
        <Layout title="Internal Server Error">
          <h1>Internal Server Error</h1>
          <p>We're sorry, but something went wrong with your request. Please try again later.</p>
          {/* Only for this demo: in production, don't show error details to visitors,
              as they can reveal internals like file paths or queries. Log them instead. */}
          <p>
            <code>{error.toString()}</code>
          </p>
          <a href={request.path}>Restart</a>
        </Layout>
      );
    };
  }

  return (
    <Layout
      title="User-friendly error messages"
      description="Catch errors at runtime and answer with a user-friendly error page."
    >
      <h1>Catch errors at runtime</h1>
      <p>
        Jeasx allows you to catch errors with a dynamic{" "}
        <a href="https://www.jeasx.dev/faq#error-handler">error handler</a>, so you can provide a
        user-friendly response when something goes wrong. Have a look at the source to see how
        things are wired up.
      </p>
      <p>
        <a href={`${request.path}?errorHandler=true`}>Force error with error handler</a>
      </p>
      <p>
        <a href={`${request.path}?errorHandler=false`}>Force error without error handler</a>
      </p>
      {request.query["errorHandler"] && <ComponentWithError />}
    </Layout>
  );
}

/** @returns {Promise<JSX.Element>} */
async function ComponentWithError() {
  throw new Error("Something went wrong while rendering this component.");
}
