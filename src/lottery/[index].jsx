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
        <h1>Lottery (6 out of 49)</h1>
        <p>
          Pick six numbers, then reveal the draw. Every click submits a plain HTML form and the
          server renders the updated page, so this works without any JavaScript in the browser.
        </p>
        <form method="post">
          <input type="hidden" name="numbers" value={JSON.stringify(numbers)} />
          <div
            class={styles.progressbar}
            style={`--currentValue: ${numbers.length}; --previousValue: ${
              numbers.length - delta
            }; --maxValue: 6`}
          />
          <div class={styles.grid}>
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
          <div>
            <div class={styles.actions}>
              {numbers.length === 6 && !submit && (
                <button type="submit" name="submit" value="submit">
                  Reveal results
                </button>
              )}
              {submit && numbers.length === 6 && (
                <button type="submit" name="restart" value="restart">
                  Start over
                </button>
              )}
            </div>
            {submit && numbers.length === 6 && <Draw numbers={numbers} />}
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
    <p>
      Drawn numbers: <strong>{drawn.join(", ")}</strong>
      <br />
      {matches.length === 0
        ? "No match this time. Reveal again for a new draw."
        : `🎉 You matched ${matches.length} of 6: ${matches.sort((a, b) => a - b).join(", ")}`}
    </p>
  );
}
