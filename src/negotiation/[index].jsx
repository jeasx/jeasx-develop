import Layout from "../Layout";
import { OFFERS } from "./planets";

const PRESETS = [
  ...OFFERS,
  "text/*;q=0.5, application/json;q=0.9",
  "text/*, text/html;q=0",
  "image/png",
];

export default function () {
  return (
    <Layout
      title="Content negotiation with Jeasx"
      description="Answer the same URL with HTML, JSON, CSV or plain text, depending on the Accept header."
      script="/negotiation/index.js"
    >
      <h1>One URL, many formats</h1>
      <p>
        With{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation">
          content negotiation
        </a>
        , a client tells the server in the <code>Accept</code> header which formats it understands
        and how much it prefers each one (the <code>q</code> weight from 0 to 1). The route{" "}
        <a href="/negotiation/planets">
          <code>/negotiation/planets</code>
        </a>{" "}
        reads the header and returns a <code>Response</code> in the best matching format, or{" "}
        <code>406 Not Acceptable</code>. It also sends <code>Vary: Accept</code>, so caches keep one
        copy per format.
      </p>
      <p>
        Pick a preset or write your own header. The request is sent with <code>fetch()</code>, as
        browsers always send their own <code>Accept</code> header when you follow a link.
      </p>
      <form id="negotiation" method="get" action="/negotiation/planets">
        <fieldset role="group">
          <input
            type="text"
            name="accept"
            aria-label="Accept header"
            value="application/json"
            required
          />
          <input type="submit" value="Send request" />
        </fieldset>
      </form>
      <p class="center">
        {PRESETS.map((accept) => (
          <>
            <button type="button" class="btn-outline" data-accept={accept}>
              {accept}
            </button>{" "}
          </>
        ))}
      </p>
      <article>
        <header>
          <output id="status" form="negotiation">
            <noscript>This playground needs JavaScript. Try the commands below instead.</noscript>
          </output>
        </header>
        <pre style="max-height: 24rem; overflow: auto;">
          <code id="body"></code>
        </pre>
      </article>
      <h2>From the command line</h2>
      <pre>
        <code>
          {OFFERS.map(
            (type) => `curl -H "Accept: ${type}" https://expo.jeasx.dev/negotiation/planets\n`,
          )}
        </code>
      </pre>
    </Layout>
  );
}
