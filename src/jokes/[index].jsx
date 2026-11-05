import Layout from "../Layout";
import { pick } from "./jokes";

const CATEGORIES = [
  { value: "programming", icon: "🤓", one: "a nerd joke", many: "nerd jokes" },
  { value: "general", icon: "🥁", one: "a pun", many: "puns" },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};
  const category = CATEGORIES.find(({ value }) => value === body["category"]);
  // The -/+ buttons send "change", so "counter" only comes from the hidden field.
  const change = body["change"] === "-1" ? -1 : body["change"] === "1" ? 1 : 0;
  const requested = (Number.parseInt(body["counter"], 10) || 3) + change;
  const counter = Math.min(Math.max(requested, 1), 5);
  const data = category ? pick(category.value, counter) : [];

  return (
    <Layout
      title="Build forms without JavaScript"
      description="Server-rendered forms that work without client-side JavaScript."
      css="/jokes/index.css"
    >
      <div class="jokes">
        <h1>Build forms without JavaScript</h1>
        <p class="lead">
          Every button below submits a plain HTML form. The server reads the form, picks the jokes
          and renders the page, so it works without any JavaScript in the browser. The number of
          jokes is passed along in a hidden form field, and the punchlines are revealed with a
          native <code>&lt;details&gt;</code> element.
        </p>
        <form method="post" class="card">
          <input type="hidden" name="counter" value={counter} />
          <div class="stepper">
            <span class="stepper-label">How many?</span>
            <button name="change" value="-1" disabled={counter === 1} aria-label="Fewer jokes">
              −
            </button>
            <output class="stepper-value">{counter}</output>
            <button name="change" value="1" disabled={counter === 5} aria-label="More jokes">
              +
            </button>
          </div>
          <div class="dots" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <span class={i <= counter ? "on" : ""} />
            ))}
          </div>
          <div class="categories">
            {CATEGORIES.map(({ value, icon, one, many }) => (
              <button
                class={`category${category?.value === value ? " selected" : ""}`}
                name="category"
                value={value}
              >
                <span class="category-icon">{icon}</span>
                <span>{counter === 1 ? `Tell me ${one}` : `Tell me ${counter} ${many}`}</span>
              </button>
            ))}
          </div>
        </form>
        {data.length > 0 && (
          <ol class="joke-list">
            {data.map(({ setup, punchline }, i) => (
              <li style={`--delay: ${i * 80}ms`}>
                <details>
                  <summary>
                    <span class="joke-number">{i + 1}</span>
                    <span class="joke-setup">{setup}</span>
                    <span class="joke-hint">Reveal</span>
                  </summary>
                  <p class="joke-punchline">{punchline}</p>
                </details>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Layout>
  );
}
