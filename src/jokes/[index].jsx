import { readSignedCookie } from "../@helpers/cookies";
import Layout from "../Layout";
import jokes from "./jokes";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = request.body || {};
  const category = body["category"];
  // Keep the counter between 1 and 5, even for tampered form data
  // or a signed value of another cookie (see "../@helpers/cookies.js").
  const counter = Math.min(
    Math.max(Math.trunc(Number(body["counter"] || readSignedCookie(request, "counter"))) || 3, 1),
    5,
  );
  const data = category ? jokes(category, counter) : [];
  reply.setCookie("counter", String(counter), { path: "/jokes", signed: true });

  return (
    <Layout
      title="Build forms without JavaScript"
      description="Server-rendered forms that work without client-side JavaScript."
    >
      <h1>Build forms without JavaScript</h1>
      <p>
        Every button below submits a plain HTML form. The server reads the form, picks the jokes and
        renders the page, so it works without any JavaScript in the browser. The number of jokes is
        remembered in a cookie.
      </p>
      <form method="post">
        <fieldset class="grid">
          <button
            class="btn btn-secondary"
            name="counter"
            value={counter - 1}
            disabled={counter === 1}
            aria-label="Fewer jokes"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            name="counter"
            value={counter + 1}
            disabled={counter === 5}
            aria-label="More jokes"
          >
            +
          </button>
        </fieldset>
        <fieldset class="grid">
          <button class="btn btn-primary" name="category" value="programming">
            {counter === 1 ? "Tell me a nerd joke" : `Tell me ${counter} nerd jokes`}
          </button>
        </fieldset>
        <fieldset class="grid">
          <button class="btn btn-primary" name="category" value="general">
            {counter === 1 ? "Tell me a pun" : `Tell me ${counter} puns`}
          </button>
        </fieldset>
      </form>
      {data.length > 0 && (
        <ul>
          {data.map((joke) => (
            <li>{joke}</li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
