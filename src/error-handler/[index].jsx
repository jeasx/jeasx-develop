import Layout from "../Layout";

/**
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
          <p>
            We're sorry, but something went wrong with your request. Our team has been notified and
            is working to resolve the issue. Please try again later.
          </p>
          <p>
            <code>{error.toString()}</code>
          </p>
          <a href={request.path}>Restart</a>
        </Layout>
      );
    };
  }

  return (
    <Layout title="User friendly error messages">
      <h1>Catch errors at runtime</h1>
      <p>
        Jeasx allows you to catch errors with a dynamic{" "}
        <a href="https://www.jeasx.dev/faq#error-handler">error handler</a>, so you can provide a
        user-friendly response when something goes wrong. Have a look at the source how things are
        wired up.
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

async function ComponentWithError() {
  return <div>{await (await fetch("/invalid")).text()}</div>;
}
