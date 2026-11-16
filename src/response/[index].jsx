import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Return web-standard responses"
      description="Route handlers can return a standard Response object with status, headers and body."
      css="/response/index.css"
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
        <Card href="./data.json" title="JSON" status="200" type="application/json">
          <Code>{`Response.json(data)`}</Code>
          <p>Sets body and content type in one go.</p>
        </Card>
        <Card href="./redirect" title="Redirect" status="303" type="Location: /response">
          <Code>{`new Response(null, {\n  status: 303, headers\n})`}</Code>
          <p>Sends the browser straight back to this page.</p>
        </Card>
        <Card href="./teapot" title="Custom status" status="418" type="text/plain">
          <Code>{`new Response(body, {\n  status: 418\n})`}</Code>
          <p>Any status code works, even the teapot.</p>
        </Card>
        <Card href="./proxy" title="Proxy" status="200" type="from api.github.com">
          <Code>{`fetch(url)`}</Code>
          <p>Passes a remote response through, cached for five minutes.</p>
        </Card>
      </div>
    </Layout>
  );
}

function Card({ href, title, status, type, children }) {
  const kind = status.startsWith("2") ? "success" : status.startsWith("3") ? "secondary" : "error";
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
