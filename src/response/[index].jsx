import Layout from "../Layout";
import { OFFERS } from "./planets";

const PRESETS = [...OFFERS, "image/png"];

export default function () {
  return (
    <Layout
      title="Return web-standard responses"
      description="Return a standard Response object with status, headers and body, and pick its format from the Accept header."
      css="/response/index.css"
      script="/response/index.js"
    >
      <h1>Return web-standard responses</h1>
      <p class="lead">
        Besides JSX, strings, buffers and JSON, a route can return a standard{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Response">Response</a> object:
        status, headers and body are taken from it.
      </p>
      <p>
        This makes it easy to reuse code written for other web-standard runtimes or to proxy a{" "}
        <code>fetch</code> call straight through. Click a card to see each response.
      </p>
      <div class="response-grid">
        <Card href="./export.csv" title="CSV download" status="200" type="text/csv">
          <Code>{`new Response(csv, { headers })`}</Code>
          <p>
            A <code>content-disposition</code> header makes the browser save it as a file.
          </p>
        </Card>
        <Card href="./redirect" title="Redirect" status="303" type="Location: /response">
          <Code>{`new Response(null, {\n  status: 303, headers\n})`}</Code>
          <p>Sends the browser straight back to this page.</p>
        </Card>
        <Card href="./proxy" title="Proxy" status="200" type="from api.github.com">
          <Code>{`fetch(url)`}</Code>
          <p>Passes a remote response through, cached for five minutes.</p>
        </Card>
      </div>

      <h2 id="content-negotiation">Content negotiation: one URL, many formats</h2>
      <p>
        With{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation">
          content negotiation
        </a>
        , a client tells the server in the <code>Accept</code> header which formats it understands
        and how much it prefers each one.
      </p>
      <p>
        The route{" "}
        <a href="/response/planets">
          <code>/response/planets</code>
        </a>{" "}
        reads the header and returns a <code>Response</code> in the best matching format, or{" "}
        <code>406 Not Acceptable</code>. It also sends <code>Vary: Accept</code>, so caches keep one
        copy per format.
      </p>
      <p>
        Pick an <code>Accept</code> header below. The request is sent with <code>fetch()</code>, as
        browsers always send their own <code>Accept</code> header when you follow a link.
      </p>
      <p class="presets" data-url="/response/planets">
        {PRESETS.map((accept) => (
          <button
            type="button"
            class="btn-outline"
            data-accept={accept}
            aria-pressed={accept === "application/json" ? "true" : "false"}
          >
            {accept}
          </button>
        ))}
      </p>
      <article>
        <header>
          <output id="status">
            <noscript>This playground needs JavaScript. Try the commands below instead.</noscript>
          </output>
        </header>
        <pre style="max-height: 24rem; overflow: auto;">
          <code id="body"></code>
        </pre>
      </article>
      <h3>From the command line</h3>
      <pre>
        <code>
          {OFFERS.map(
            (type) => `curl -H "Accept: ${type}" https://expo.jeasx.dev/response/planets\n`,
          )}
        </code>
      </pre>
    </Layout>
  );
}

function Card({ href, title, status, type, children }) {
  const kind = status.startsWith("2") ? "success" : "secondary";
  return (
    <a class="response-card" href={href}>
      <article>
        <header>
          <strong>{title}</strong>
          <span class={`badge badge-${kind}`}>{status}</span>
        </header>
        {children}
        <footer>
          <code>GET {href.slice(1)}</code>
          <span>{type}</span>
        </footer>
      </article>
    </a>
  );
}

function Code({ children }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
}
