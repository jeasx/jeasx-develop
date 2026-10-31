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
        <h1>Enhance your application with React</h1>
        <p>
          Jeasx lets you add React in userland: components are rendered on the server and hydrated
          in the browser. This gives you islands of interactivity without rendering the whole
          application in the browser.
        </p>
      </section>
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
