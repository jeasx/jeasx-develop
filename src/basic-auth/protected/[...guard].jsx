import Layout from "../../Layout";

const BASIC_AUTH = `Basic ${Buffer.from("demo:demo").toString("base64")}`;

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // If a static file is requested (e.g., a CSS file),
  // the 'reply.file' property is pre-populated with a file stream.
  // We use this to bypass authentication for static assets.
  if (reply.file) {
    return;
  }

  // Check and send authorization headers.
  const authorization = request.headers["authorization"];
  if (authorization !== BASIC_AUTH) {
    reply.header("WWW-Authenticate", 'Basic realm="Restricted Area');
    reply.status(401);
    return (
      <Layout title="Error 401" css="./index.css">
        <section class="center">
          <h1 class="access-denied">Error 401</h1>
          <p>You are not allowed to view the protected content.</p>
          <p>
            Please <a href="">reload page</a> and enter correct credentials (demo / demo).
          </p>
        </section>
      </Layout>
    );
  } else {
    return (
      <Layout title="Access granted" css="./index.css">
        <section class="center">
          <h1 class="access-granted">Access granted</h1>
          <p>You are allowed to view the protected content.</p>
        </section>
      </Layout>
    );
  }
}
