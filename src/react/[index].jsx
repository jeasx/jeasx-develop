import Layout from "../Layout";
import React from "./assets/React";

export default function () {
  return (
    <Layout
      title="Use React with Jeasx"
      description="Supporting React in Jeasx"
      css="/react/assets/index.css"
      script="/react/assets/index.js"
    >
      <section class="center">
        <h1>Enhance your application with React</h1>
        <p>
          Jeasx allows you to integrate React as a frontend library in userland. This is useful to
          build islands of interactivity for a better user experience without having to render the
          whole application in the browser.
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
