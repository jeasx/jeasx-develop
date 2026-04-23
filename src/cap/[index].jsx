import Layout from "../Layout";
import cap from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  if (request.method === "POST") {
    const token = request.body?.["cap-token"];
    if (token) {
      const { success } = await cap.validateToken(token);
      if (success) {
        const name = request.body?.["name"];
        return (
          <Layout>
            <h1>Thank you, {name}!</h1>
            <p>Simply reload this page to simulate an invalid captcha process.</p>
            <hr />
            <a href={request.path}>Start again</a>
          </Layout>
        );
      } else {
        return (
          <Layout>
            <h1>No success!</h1>
            <a href={request.path}>Start again</a>
          </Layout>
        );
      }
    }
  }

  return (
    <Layout
      title="Use a captcha in Jeasx"
      description="Using Cap.js as proof-of-work captcha with Jeasx"
      script="./index.js"
    >
      <h1>Cap.js - A modern, lightning-quick PoW captcha</h1>
      <p>
        <a href="https://capjs.js.org">Cap.js</a> is a lightweight, modern open-source CAPTCHA
        alternative using proof-of-work. This example demonstrates how to integrate Cap.js with
        Jeasx to protect form submissions.
      </p>
      <form action="" method="post">
        <label>
          Enter your name:
          <input type="text" name="name" value={request?.body?.["name"]} />
        </label>
        <label>
          <cap-widget data-cap-api-endpoint={`${request.path}/`}></cap-widget>
        </label>
        <label>
          <input class="btn btn-primary" type="submit" value="Submit" />
        </label>
      </form>
    </Layout>
  );
}
