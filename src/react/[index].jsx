import Layout from "../Layout";
import React from "./assets/React";

export default function () {
  return (
    <Layout
      title="Use React with Jeasx"
      description="Render React components on the server and hydrate them as interactive islands."
      css="/react/assets/index.css"
      script="/react/assets/index.js"
    >
      <section class="center">
        <h1>Use React with Jeasx</h1>
        <p>
          Jeasx lets you add React in userland: components are rendered on the server and hydrated
          in the browser. This gives you islands of interactivity without rendering the whole
          application in the browser.
        </p>
      </section>
      <details>
        <summary>How do I integrate React with Jeasx?</summary>
        <p>Install React and React DOM:</p>
        <pre>
          <code>npm install react react-dom</code>
        </pre>
        <p>
          React brings its own JSX runtime, so add a <code>tsconfig.json</code> to the folder that
          holds your React components:
        </p>
        <pre>
          <code>
            {`{
  "extends": "jeasx/tsconfig.json",
  "compilerOptions": {
    "jsxImportSource": "react"
  },
  "include": ["**/*"]
}`}
          </code>
        </pre>
        <p>
          Have a look at the{" "}
          <a href="https://github.com/jeasx/jeasx-expo/tree/main/src/react">
            source code of this page
          </a>{" "}
          to see how the components are rendered on the server and hydrated in the browser.
        </p>
      </details>
      <hr />
      <section>
        <h2>Lottery</h2>
        <React component="Lottery" title="6 out of 49" />
      </section>
      <hr />
      <section>
        <h2>Analog clock</h2>
        <React component="Clock" />
      </section>
    </Layout>
  );
}
