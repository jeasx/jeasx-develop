import isAuthorized from "../isAuthorized";
import Layout from "../../Layout";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // If a static file is requested, the 'reply.file' property is pre-populated with a file stream.
  // Only stylesheets bypass authentication, so the error page is styled.
  // Every other file (e.g. a PDF placed next to them) is only served after signing in.
  if (reply.file && request.path.endsWith(".css")) {
    return;
  }

  // Check and send authorization headers.
  if (!isAuthorized(request.headers["authorization"])) {
    reply.header("WWW-Authenticate", 'Basic realm="Restricted Area"');
    reply.status(401);
    return (
      // An absolute path, as this guard answers deeper paths like "/basic-auth/protected/a/b" too,
      // where "./index.css" would point to a file that doesn't exist.
      <Layout title="Error 401" css="/basic-auth/protected/index.css">
        <article class="card-error status">
          <div class="status-icon" aria-hidden="true">
            &times;
          </div>
          <h1>Access denied</h1>
          <p>
            Error 401: the credentials are missing or wrong, so the protected content stays hidden.
          </p>
          <footer>
            <a href="" class="btn btn-primary">
              Try again
            </a>{" "}
            <a href="/basic-auth" class="btn btn-secondary">
              Back to the example
            </a>
          </footer>
        </article>
      </Layout>
    );
  } else if (reply.file) {
    // Signed in: serve the requested file.
    return;
  } else {
    return (
      <Layout title="Access granted" css="/basic-auth/protected/index.css">
        <article class="card-success status">
          <div class="status-icon" aria-hidden="true">
            &#10003;
          </div>
          <h1>Access granted</h1>
          <p>
            Your browser sent valid credentials, so the guard let the request through to the
            protected content.
          </p>
          <footer>
            <a href="/basic-auth" class="btn btn-secondary">
              Back to the example
            </a>
          </footer>
        </article>
      </Layout>
    );
  }
}
