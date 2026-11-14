import Layout from "../Layout";
import Tree from "./Tree";

const EXAMPLES = ["jeasx", "express", "vite", "eslint", "fastify", "next"];

export default function () {
  return (
    <Layout
      title="Dependency tree with async JSX"
      description="Explore npm dependency trees rendered by async JSX components in the browser with jsx-async-runtime."
      css="/dependency-tree/index.css"
      script="/dependency-tree/index.js"
    >
      <h1>Dependency tree with async JSX</h1>
      <p class="lead">
        Every package is an <code>async</code> component that awaits its manifest from the npm
        registry. With <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>,
        the same components render the first tree on the server and every following one in your
        browser, streamed into the page while they are still waiting for data.
      </p>
      <div class="workbench">
        <section class="explorer">
          <form id="explorer" class="search">
            <span class="prompt" aria-hidden="true">
              npm view
            </span>
            <input
              type="text"
              name="name"
              value="jeasx"
              aria-label="Package name"
              placeholder="package-name"
              required
              autocomplete="off"
              spellcheck="false"
            />
            <button type="submit">Explore →</button>
          </form>
          <div class="examples">
            {EXAMPLES.map((name) => (
              <button type="button" class="chip" data-name={name}>
                {name}
              </button>
            ))}
          </div>
          <div id="result" class="result">
            <Tree name="jeasx" where="on the server" />
          </div>
        </section>
        <aside class="sidebar">
          <div class="panel live" id="live">
            <div class="panel-title">
              <span class="dot" /> <span id="live-status">Rendered on the server</span>
            </div>
            <div class="meters">
              <div class="meter">
                <strong id="live-loaded">–</strong>
                <span>packages</span>
              </div>
              <div class="meter">
                <strong id="live-ms">–</strong>
                <span>ms</span>
              </div>
            </div>
            <div class="bar">
              <span id="live-bar" />
            </div>
          </div>
          <ol class="panel steps">
            <li>
              <strong>Prefetch</strong>
              All registry requests of the visible tree start at once.
            </li>
            <li>
              <strong>Await</strong>
              Each <code>async</code> Package component awaits a promise already in flight.
            </li>
            <li>
              <strong>Stream</strong>
              <code>jsxToStream()</code> sends markup whenever a component waits, so the tree grows
              in order.
            </li>
            <li>
              <strong>Drill</strong>
              Open a package to stream its dependencies into it the same way.
            </li>
          </ol>
        </aside>
      </div>
    </Layout>
  );
}
