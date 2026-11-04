import Layout from "../Layout";
import cap from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  let error = "";
  if (request.method === "POST") {
    const token = request.body?.["cap-token"];
    // A repeated field arrives as array, which the Cap library can't handle.
    if (typeof token !== "string" || !token) {
      // E.g. submitted before the captcha was solved.
      error = "Please solve the captcha before submitting the form.";
      reply.status(400);
    } else {
      const { success } = await cap.validateToken(token);
      if (success) {
        // An empty name would read "Thank you, !".
        const name = String(request.body?.["name"] ?? "").trim() || "stranger";
        return (
          <Layout title="Thank you" css="/cap/index.css">
            <article class="card-success result">
              <div class="result-icon" aria-hidden="true">
                &#10003;
              </div>
              <h1>Thank you, {name}!</h1>
              <p>Your form was accepted. This is what happened:</p>
              <ol class="result-steps">
                <li>Your browser fetched a challenge and solved it in the background.</li>
                <li>The server redeemed the solution for a one-time token.</li>
                <li>The form sent the token along and the server validated it.</li>
              </ol>
              <footer>
                {/* Sends the same token again, like a bot replaying a solved captcha. */}
                <form method="post" class="result-actions">
                  <input type="hidden" name="name" value={name} />
                  <input type="hidden" name="cap-token" value={token} />
                  <button type="submit" class="btn btn-secondary">
                    Reuse the token
                  </button>
                  <a href={request.path} class="btn btn-primary">
                    Start again
                  </a>
                </form>
                <small>Each token works only once, so reusing it is rejected.</small>
              </footer>
            </article>
          </Layout>
        );
      } else {
        reply.status(400);
        return (
          <Layout title="Captcha check failed" css="/cap/index.css">
            <article class="card-error result">
              <div class="result-icon" aria-hidden="true">
                &times;
              </div>
              <h1>Captcha check failed</h1>
              <p>The captcha token is invalid, expired or was already used.</p>
              <footer>
                <a href={request.path} class="btn btn-primary">
                  Start again
                </a>
              </footer>
            </article>
          </Layout>
        );
      }
    }
  }

  return (
    <Layout
      title="Use Cap.js with Jeasx"
      description="Protect a form with Cap.js, a proof-of-work captcha, in Jeasx."
      script="/cap/index.js"
      css="/cap/index.css"
    >
      <h1>Use Cap.js with Jeasx</h1>
      <p>
        <a href="https://capjs.js.org">Cap.js</a> is a lightweight, modern open-source captcha
        alternative using proof-of-work: instead of solving puzzles, your browser does a short
        calculation in the background. Enter your name, click the captcha and submit the form.
      </p>
      <article class="cap-card">
        <header>
          <strong>Contact form</strong>
        </header>
        {error && (
          <p class="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <form action="" method="post">
          <label>
            Your name
            <input
              type="text"
              name="name"
              autocomplete="name"
              placeholder="Jane Doe"
              value={String(request.body?.["name"] ?? "")}
            />
          </label>
          <cap-widget data-cap-api-endpoint={`${request.path.replace(/\/$/, "")}/`}></cap-widget>
          <button class="btn btn-primary wide" type="submit">
            Submit
          </button>
        </form>
      </article>
    </Layout>
  );
}
