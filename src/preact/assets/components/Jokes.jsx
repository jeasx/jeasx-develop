/** @jsxImportSource preact */
import { useState } from "preact/hooks";

const CATEGORIES = [
  { key: "programming", icon: "💻", one: "a nerd joke", many: "nerd jokes" },
  { key: "general", icon: "🥁", one: "a pun", many: "puns" },
];

export default function Jokes({ initial, api }) {
  const [counter, setCounter] = useState(initial);
  const [jokes, setJokes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  async function load(category) {
    setLoading(category);
    try {
      const response = await fetch(
        `${api}/${encodeURIComponent(category)}?amount=${counter}`,
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      setJokes(await response.json());
      setError("");
    } catch {
      setJokes([]);
      setError("The jokes could not be loaded. Please try again.");
    } finally {
      setLoading("");
    }
  }

  return (
    <div class="pr-card">
      <div class="pr-stepper">
        <button
          type="button"
          onClick={() => setCounter(counter - 1)}
          disabled={counter === 1}
          aria-label="Fewer jokes"
        >
          −
        </button>
        <output aria-live="polite">
          <strong>{counter}</strong>
          <span>{counter === 1 ? "joke" : "jokes"}</span>
        </output>
        <button
          type="button"
          onClick={() => setCounter(counter + 1)}
          disabled={counter === 5}
          aria-label="More jokes"
        >
          +
        </button>
      </div>
      <div class="pr-actions">
        {CATEGORIES.map(({ key, icon, one, many }) => (
          <button
            key={key}
            type="button"
            class="pr-btn"
            onClick={() => load(key)}
            disabled={loading !== ""}
            aria-busy={loading === key}
          >
            <span aria-hidden="true">{icon}</span>{" "}
            {counter === 1 ? `Tell me ${one}` : `Tell me ${counter} ${many}`}
          </button>
        ))}
      </div>
      {error && (
        <p class="pr-error" role="alert">
          {error}
        </p>
      )}
      {jokes.length > 0 ? (
        <ol class="pr-jokes" aria-live="polite">
          {jokes.map((joke, index) => (
            <li key={joke} style={{ animationDelay: `${index * 80}ms` }}>
              {joke}
            </li>
          ))}
        </ol>
      ) : (
        !error && <p class="pr-empty">Pick a category to get some laughs.</p>
      )}
    </div>
  );
}
