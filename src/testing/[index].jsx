import { html } from "jsx-async-runtime";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import Layout from "../Layout";
import { Greeting, Price, UserCard } from "./components";
// The build bundles the test file as a string, so the page always shows the current tests.
// @ts-ignore: TypeScript doesn't know text imports and expects a default export.
import testSource from "./components.test.jsx" with { type: "text" };

/**
 * @this {import("../types").ThisContext & { locale?: string, currency?: string }}
 */
export default function () {
  // Price reads both from the "this" context.
  this.locale = "en-US";
  this.currency = "EUR";

  return (
    <Layout
      title="Unit tests for JSX components"
      description="Test JSX components and whole routes with node:test and jsxToString, without a browser."
    >
      <h1>Unit tests for JSX components</h1>
      <p>
        Components are plain functions which return JSX, and <code>jsxToString</code> of{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> turns them into
        an HTML string. So you can test them with the built-in test runner of Node.js and simple
        string checks: no browser, no DOM and no extra test framework needed.
      </p>
      <ul>
        <li>
          Async components are awaited by <code>jsxToString</code>, so tests just <code>await</code>{" "}
          the result.
        </li>
        <li>
          Pass dependencies like data loaders as props, so tests can replace remote APIs with fakes.
        </li>
        <li>
          Use <code>jsxToString.call(context, …)</code> to test components which read from{" "}
          <code>this</code>.
        </li>
        <li>
          Routes are functions as well: call them with fake <code>request</code> and{" "}
          <code>reply</code> objects and check the JSX or <code>Response</code> they return.
        </li>
      </ul>

      <h2>The components</h2>
      <article>
        <Greeting name="<script>alert('Escaped!')</script>" />
        <p>
          Price: <Price amount={1234.5} />
        </p>
        <UserCard id={1} />
      </article>

      <h2>The tests</h2>
      <p>
        Test files end with <code>.test.js</code> or <code>.test.jsx</code> and live next to the
        code they test, e.g. for the <a href="/i18n">i18n</a>,{" "}
        <a href="/negotiation">content negotiation</a> and <a href="/svg">SVG charts</a> examples.
        Node.js can't run JSX directly, so <code>npm test</code> bundles the test files with esbuild
        first and then runs them with <code>node --test</code>:
      </p>
      <pre>
        <code>npm test</code>
      </pre>
      <details open>
        <summary>components.test.jsx</summary>
        <pre class="language-jsx">
          <code class="language-jsx">
            {html(Prism.highlight(testSource, Prism.languages.jsx, "jsx"))}
          </code>
        </pre>
      </details>
    </Layout>
  );
}
