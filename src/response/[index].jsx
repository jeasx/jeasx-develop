import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Return Web Standard Responses with Jeasx"
      description="Route handlers can return a standard Response object with status, headers and body."
    >
      <h1>Return Web Standard Responses</h1>
      <p>
        Besides JSX, strings, buffers and JSON, a route can return a standard{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Response">Response</a> object.
        Status, headers and body are taken from it. This makes it easy to reuse code written for
        other web-standard runtimes or to proxy a <code>fetch</code> call straight through.
      </p>
      <div class="row center">
        <Card href="./export.csv" title="CSV download">
          <code>new Response(csv, {"{ headers }"})</code> with a <code>content-disposition</code>{" "}
          header.
        </Card>
        <Card href="./data.json" title="JSON">
          <code>Response.json(data)</code> sets body and content type in one go.
        </Card>
        <Card href="./redirect" title="Redirect">
          <code>new Response(null, {"{ status: 303, headers }"})</code> sends the browser back
          here.
        </Card>
        <Card href="./teapot" title="Custom status">
          <code>new Response(body, {"{ status: 418 }"})</code> for any status code.
        </Card>
        <Card href="./proxy" title="Proxy">
          <code>return fetch(url)</code> passes a remote response through.
        </Card>
      </div>
    </Layout>
  );
}

function Card({ href, title, children }) {
  return (
    <article class="col-12 col-md-4">
      <header>
        <a href={href}>
          <strong>{title}</strong>
        </a>
      </header>
      <p>{children}</p>
    </article>
  );
}
