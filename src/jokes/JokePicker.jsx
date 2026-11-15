import { CATEGORIES } from "./state";

/**
 * The interactive part of the page. Rendered on the server and, after a click, in the browser.
 *
 * @param {import("./state").State} state
 */
export default function JokePicker({ counter, category, jokes }) {
  return (
    <div data-jokes data-state={JSON.stringify({ counter, category, jokes })}>
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
              class={`category${category === value ? " selected" : ""}`}
              name="category"
              value={value}
            >
              <span class="category-icon">{icon}</span>
              <span>{counter === 1 ? `Tell me ${one}` : `Tell me ${counter} ${many}`}</span>
            </button>
          ))}
        </div>
      </form>
      {jokes.length > 0 && (
        <ol class="joke-list">
          {jokes.map(({ setup, punchline }, i) => (
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
  );
}
