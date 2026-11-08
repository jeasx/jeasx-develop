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
      <div class="re">
        <h1>Use React with Jeasx</h1>
        <p>
          Jeasx lets you add React in userland: components are rendered on the server and hydrated
          in the browser. This gives you islands of interactivity without rendering the whole
          application in the browser.
        </p>
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
        <h2>Memory</h2>
        <p>
          All rules live in one <code>useReducer</code>, an effect flips mismatched cards back, and
          the deck is shuffled with a seed from the server, so the hydrated markup matches.
        </p>
        <div class="re-card">
          <React component="Memory" seed={Math.floor(Math.random() * 1e9)} />
        </div>
        <h2>Beat sequencer</h2>
        <p>
          Click the pads and press play: the sounds are synthesized with the Web Audio API, an effect
          runs the timer, and refs let it read the latest pattern without restarting. Turn your
          sound on!
        </p>
        <div class="re-card">
          <React
            component="Beats"
            tempo={110}
            pattern={[
              "x...x...x...x...",
              "....x.......x...",
              "..x...x...x...xx",
              "x.....x...x.....",
            ].map((row) => [...row].map((char) => char === "x"))}
          />
        </div>
      </div>
    </Layout>
  );
}
