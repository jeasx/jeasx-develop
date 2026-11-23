import { html } from "jsx-async-runtime";
import Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import Layout from "../Layout";

const BOOK = '{"title": "Eloquent JSX", "author": "Ada"}';

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const url = `${request.protocol}://${request.headers.host}/api-server/books`;

  return (
    <Layout
      title="JSON API"
      description="A tiny JSON API with a single Jeasx route: GET lists books, POST adds one."
      css="/api-server/index.css"
      script="/api-server/index.js"
    >
      <h1>JSON API</h1>
      <p class="lead">
        A route in Jeasx is just a function that answers a request, so it can return JSON as well as
        HTML. This API is a single file: <code>[books].js</code>.
      </p>
      <p>
        It checks <code>request.method</code> and returns a <code>Response</code> with{" "}
        <code>Response.json()</code>, so status codes and headers are explicit.
      </p>

      <h2>List books</h2>
      <p>
        Open <a href="books">/api-server/books</a> in your browser, or search with{" "}
        <a href="books?q=fowler">?q=fowler</a>.
      </p>
      <Command method="GET">{`curl ${url}`}</Command>

      <h2>Add a book</h2>
      <p>
        Send <code>title</code> and <code>author</code> as JSON. The API answers with{" "}
        <code>201 Created</code> and the new book, or <code>400 Bad Request</code> if a field is
        missing.
      </p>
      <Command method="POST" body={BOOK}>
        {`curl -i -X POST ${url} \\
  -H 'content-type: application/json' \\
  -d '${BOOK}'`}
      </Command>

      <h2>Other methods</h2>
      <p>
        Everything else gets <code>405 Method Not Allowed</code> with an <code>Allow</code> header.
      </p>
      <Command method="DELETE">{`curl -i -X DELETE ${url}`}</Command>

      <p>
        More on returning different kinds of responses in <a href="/response">Response objects</a>{" "}
        and <a href="/negotiation">Content negotiation</a>.
      </p>
    </Layout>
  );
}

/**
 * A curl command with a button that sends the same request from the browser.
 *
 * @param {{ method: string, body?: string, children: string }} props
 */
function Command({ method, body, children }) {
  return (
    <div class="command" data-command data-method={method} data-body={body}>
      <div class="command-bar">
        <span class="command-dots" aria-hidden="true"></span>
        <span class="command-title">bash</span>
        <span class={`command-method command-${method.toLowerCase()}`}>{method}</span>
        <button type="button" data-run hidden>
          ▶ Run
        </button>
      </div>
      <pre class="language-bash">
        <code class="language-bash">
          {html(Prism.highlight(children, Prism.languages.bash, "bash"))}
        </code>
      </pre>
      <div class="command-output" data-output hidden>
        <div class="command-status">
          <strong data-response-status></strong>
          <span data-response-headers></span>
        </div>
        <pre class="language-json">
          <code class="language-json" data-response-body></code>
        </pre>
      </div>
    </div>
  );
}
