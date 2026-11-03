import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import { createPolicy } from "./policy";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const enabled = request.query["csp"] !== "off";

  return (
    <Layout
      title="Content Security Policy with nonces"
      description="Block injected scripts with a Content Security Policy and a fresh nonce for every request."
    >
      <h1>Content Security Policy with nonces</h1>
      <p>
        JSX escapes all values, but a single <code>html()</code> with untrusted content, a library
        bug or a compromised script can still bring foreign code into a page. A{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP">
          Content Security Policy
        </a>{" "}
        is the second line of defense: the browser only runs the scripts the server allowed.
      </p>
      <p>
        A guard creates a random nonce for every request, puts it into <code>this</code> and sends a
        policy which only allows scripts carrying this nonce. The layout adds{" "}
        <code>nonce={"{this.nonce}"}</code> to its script tags. Injected markup can't know the
        nonce, as it changes with every reload, so the browser refuses to run it.
      </p>
      <div class="row center">
        <a href="?csp=on" role="button" aria-disabled={enabled ? "true" : "false"}>
          Policy on
        </a>
        &nbsp;
        <a href="?csp=off" role="button" aria-disabled={enabled ? "false" : "true"}>
          Policy off
        </a>
      </div>

      <h2>The policy of this page</h2>
      {enabled ? (
        <pre>
          <code>Content-Security-Policy: {createPolicy(this.nonce).replaceAll("; ", ";\n  ")}</code>
        </pre>
      ) : (
        <p>No policy is sent, so the browser runs every script on this page.</p>
      )}

      {/* Lists what the browser blocked. It runs first, so it sees all violations below. */}
      <script nonce={this.nonce}>
        {html(/* js */ `document.addEventListener("securitypolicyviolation", (event) => {
          const item = document.createElement("li");
          item.textContent = event.effectiveDirective + " blocked " + event.blockedURI;
          document.getElementById("violations").append(item);
        });`)}
      </script>

      <h2>Try it</h2>
      <div class="row">
        <Check
          id="with-nonce"
          title="Script with nonce"
          initial="Didn't run"
          description="An inline script rendered with nonce={this.nonce}, like the layout's scripts."
        >
          <script nonce={this.nonce}>
            {html(/* js */ `document.getElementById("with-nonce").textContent =
              "Ran, as it carries the nonce.";`)}
          </script>
        </Check>
        <Check
          id="without-nonce"
          title="Script without nonce"
          initial="Blocked"
          description="The same inline script, but without the nonce, like an injected one."
        >
          <script>
            {html(/* js */ `document.getElementById("without-nonce").textContent =
              "Ran, as there is no policy.";`)}
          </script>
        </Check>
        <Check
          id="injected"
          title="Injected event handler"
          initial="Blocked"
          description="Simulates a bug: untrusted markup with an onerror handler, inserted via html()."
        >
          {html(/* html */ `<img src="/csp/missing.png" alt="" hidden
            onerror="document.getElementById('injected').textContent =
              'Ran: injected code could read the page and send it anywhere.'">`)}
        </Check>
      </div>

      <h2>Blocked by the browser</h2>
      <p>
        The browser reports every violation as a <code>securitypolicyviolation</code> event (and in
        the console). With a <code>report-to</code> directive, it can also send them to your server.
      </p>
      {enabled ? <ul id="violations"></ul> : <p>Nothing is blocked without a policy.</p>}
    </Layout>
  );
}

/**
 * A demo whose status is replaced by its script, if the browser runs it.
 *
 * @param {{ id: string, title: string, initial: string, description: string, children: unknown }} props
 */
function Check({ id, title, initial, description, children }) {
  return (
    <article class="col-12 col-md-4">
      <header>
        <strong>{title}</strong>
      </header>
      <p>
        <small>{description}</small>
      </p>
      <p>
        <strong id={id}>{initial}</strong>
      </p>
      {children}
    </article>
  );
}
