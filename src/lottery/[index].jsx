import Layout from "../Layout";
import styles from "./index.module.css";

export default function ({ number, delta, numbers, submit }) {
  return (
    <Layout
      title={`Lottery ${numbers.join(", ")}`}
      description="A fake lottery"
      css="./index.module.css"
    >
      <div class={styles.lottery}>
        <h1>Lottery (6 out of 49)</h1>
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
            {numbers.length === 6 && (
              <button type="submit" name="submit" value="submit">
                Reveal results
              </button>
            )}
            {submit && (
              <p>
                {Array(6)
                  .fill(0)
                  .map(() => (Math.random() > 0.8 ? "🎉" : "❌"))
                  .join(" ")}
              </p>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}
