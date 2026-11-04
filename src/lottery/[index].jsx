import Layout from "../Layout";
import styles from "./index.module.css";

export default function ({ number, delta, numbers, submit }) {
  return (
    <Layout
      title={numbers.length > 0 ? `Lottery ${numbers.join(", ")}` : "Lottery"}
      description="Pick six numbers with plain HTML forms, no client-side JavaScript needed."
      css="/lottery/index.module.css"
    >
      <div class={styles.lottery}>
        <h1>
          Lottery <span class={styles.badge}>6 out of 49</span>
        </h1>
        <p class={styles.lead}>
          Pick six numbers, then reveal the draw. Every click submits a plain HTML form and the
          server renders the updated page, so this works without any JavaScript in the browser.
        </p>
        <form method="post">
          <input type="hidden" name="numbers" value={JSON.stringify(numbers)} />
          <div class={styles.status}>
            <span>Your picks</span>
            <strong>{numbers.length} / 6</strong>
          </div>
          <div
            class={styles.progressbar}
            style={`--currentValue: ${numbers.length}; --previousValue: ${
              numbers.length - delta
            }; --maxValue: 6`}
          />
          {submit && numbers.length === 6 ? (
            <Draw numbers={numbers} />
          ) : (
            <div class={`${styles.grid}${numbers.length === 6 ? " " + styles.full : ""}`}>
              {Array.from({ length: 49 }, (_, index) => (
                <button
                  class={`${styles.box}${numbers.includes(index + 1) ? " " + styles.checked : ""}${number === index + 1 ? " " + styles.last : ""}`}
                  type="submit"
                  name="number"
                  value={index + 1}
                  disabled={numbers.length === 6 && !numbers.includes(index + 1)}
                  autofocus={number === index + 1}
                >
                  {numbers.includes(index + 1) ? "✓" : index + 1}
                </button>
              ))}
            </div>
          )}
          <div>
            <div class={styles.actions}>
              {numbers.length === 6 && !submit && (
                <button type="submit" name="submit" value="submit">
                  Reveal results
                </button>
              )}
              {submit && numbers.length === 6 && (
                <>
                  <button type="submit" name="restart" value="restart">
                    Start over
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

/**
 * Draws six random numbers and shows which of the picked numbers match.
 *
 * @param {{ numbers: number[] }} props
 */
function Draw({ numbers }) {
  const pool = Array.from({ length: 49 }, (_, index) => index + 1);
  const drawn = Array.from(
    { length: 6 },
    () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0],
  ).sort((a, b) => a - b);
  const matches = numbers.filter((number) => drawn.includes(number));
  return (
    <section class={styles.draw}>
      <h2>The draw</h2>
      <ol class={styles.balls}>
        {drawn.map((number, index) => (
          <li
            class={`${styles.ball}${matches.includes(number) ? " " + styles.match : ""}`}
            style={`--delay: ${index * 150}ms`}
          >
            {number}
          </li>
        ))}
      </ol>
      <p class={styles.result}>
        {matches.length === 0 ? "No match this time." : `🎉 You matched ${matches.length} of 6`}
      </p>
    </section>
  );
}
