/**
 * The interactive part of the page. Rendered on the server and, after a click, in the browser.
 *
 * @param {import("./state").State} state
 */
export default function Lottery({ number, numbers, revealed }) {
  // The last clicked number was added if it is picked now, otherwise removed.
  const previousValue = !number
    ? numbers.length
    : numbers.length + (numbers.includes(number) ? -1 : 1);

  return (
    <form method="post" data-lottery data-state={JSON.stringify({ number, numbers, revealed })}>
      <input type="hidden" name="numbers" value={JSON.stringify(numbers)} />
      <div class="lottery-status">
        <span>Your picks</span>
        <strong>{numbers.length} / 6</strong>
      </div>
      <div
        class="lottery-progressbar"
        style={`--currentValue: ${numbers.length}; --previousValue: ${previousValue}; --maxValue: 6`}
      />
      {revealed ? (
        <Draw numbers={numbers} />
      ) : (
        <div class={`lottery-grid${numbers.length === 6 ? " lottery-full" : ""}`}>
          {Array.from({ length: 49 }, (_, index) => (
            <button
              class={`lottery-box${numbers.includes(index + 1) ? " lottery-checked" : ""}${number === index + 1 ? " lottery-last" : ""}`}
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
        <div class="lottery-actions">
          {numbers.length === 6 && !revealed && (
            <button type="submit" name="intent" value="reveal">
              Reveal results
            </button>
          )}
          {revealed && (
            <button type="submit" name="intent" value="restart">
              Start over
            </button>
          )}
        </div>
      </div>
    </form>
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
    <section class="lottery-draw">
      <h2>The draw</h2>
      <ol class="lottery-balls">
        {drawn.map((number, index) => (
          <li
            class={`lottery-ball${matches.includes(number) ? " lottery-match" : ""}`}
            style={`--delay: ${index * 150}ms`}
          >
            {number}
          </li>
        ))}
      </ol>
      <p class="lottery-result">
        {matches.length === 0 ? "No match this time." : `🎉 You matched ${matches.length} of 6`}
      </p>
    </section>
  );
}
