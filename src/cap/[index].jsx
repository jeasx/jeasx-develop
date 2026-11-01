import Layout from "../Layout";
import cap from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  let error = "";
  if (request.method === "POST") {
    const token = request.body?.["cap-token"];
    if (!token) {
      // E.g. submitted before the captcha was solved.
      error = "Please solve the captcha before submitting the form.";
      reply.status(400);
    } else {
      const { success } = await cap.validateToken(token);
      if (success) {
        // An empty name would read "Thank you, !".
        const name = String(request.body?.["name"] ?? "").trim() || "stranger";
        return (
          <Layout title="Thank you">
            <h1>Thank you, {name}!</h1>
            <p>
              Try reloading this page: your browser sends the form again with the same captcha
              token, which is rejected, as each token can only be used once.
            </p>
            <hr />
            <a href={request.path}>Start again</a>
          </Layout>
        );
      } else {
        reply.status(400);
        return (
          <Layout title="Captcha check failed">
            <h1>Captcha check failed</h1>
            <p>The captcha token is invalid, expired or was already used.</p>
            <a href={request.path}>Start again</a>
          </Layout>
        );
      }
    }
  }

  return (
    <Layout
      title="Use a captcha with Jeasx"
      description="Protect a form with Cap.js, a proof-of-work captcha, in Jeasx."
      script="/cap/index.js"
    >
      <h1>Use a captcha with Jeasx</h1>
      <p>
        <a href="https://capjs.js.org">Cap.js</a> is a lightweight, modern open-source captcha
        alternative using proof-of-work: instead of solving puzzles, your browser does a short
        calculation in the background. Enter your name, click the captcha and submit the form.
      </p>
      {error && <p role="alert">{error}</p>}
      <form action="" method="post">
        <label>
          Enter your name:
          <input type="text" name="name" value={request.body?.["name"]} />
        </label>
        <p>
          <cap-widget data-cap-api-endpoint={`${request.path.replace(/\/$/, "")}/`}></cap-widget>
        </p>
        <p>
          <input class="btn btn-primary" type="submit" value="Submit" />
        </p>
      </form>
    </Layout>
  );
}
