import Layout from "../Layout";
import jokes from "./jokes";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};
  const category = body["category"];
  // The -/+ buttons send "change", so "counter" only comes from the hidden field.
  const change = body["change"] === "-1" ? -1 : body["change"] === "1" ? 1 : 0;
  const requested = (parseInt(body["counter"]) || 3) + change;
  const counter = Math.min(Math.max(requested, 1), 5);
  const data = category ? jokes(category, counter) : [];

  return (
    <Layout
      title="Build forms without JavaScript"
      description="Server-rendered forms that work without client-side JavaScript."
    >
      <h1>Build forms without JavaScript</h1>
      <p>
        Every button below submits a plain HTML form. The server reads the form, picks the jokes and
        renders the page, so it works without any JavaScript in the browser. The number of jokes is
        passed along in a hidden form field.
      </p>
      <form method="post">
        <input type="hidden" name="counter" value={counter} />
        <fieldset class="grid">
          <button
            class="btn btn-secondary"
            name="change"
            value="-1"
            disabled={counter === 1}
            aria-label="Fewer jokes"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            name="change"
            value="1"
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
