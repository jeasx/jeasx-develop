/** @jsxImportSource preact */
import { useState } from "preact/hooks";

export default function Jokes({ initial, api }) {
  const [counter, setCounter] = useState(initial);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  async function submit(category) {
    try {
      const response = await fetch(`${api}/${encodeURIComponent(category)}?amount=${counter}`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      setData(await response.json());
      setError("");
    } catch {
      setData([]);
      setError("The jokes could not be loaded. Please try again.");
    }
  }

  return (
    <>
      <fieldset class="grid">
        <button
          class="btn btn-secondary"
          onClick={() => setCounter(counter - 1)}
          disabled={counter === 1}
          aria-label="Fewer jokes"
        >
          -
        </button>
        <button
          class="btn btn-secondary"
          onClick={() => setCounter(counter + 1)}
          disabled={counter === 5}
          aria-label="More jokes"
        >
          +
        </button>
      </fieldset>
      <fieldset class="grid">
        <button class="btn btn-primary" onClick={() => submit("programming")}>
          {counter === 1 ? "Tell me a nerd joke" : `Tell me ${counter} nerd jokes`}
        </button>
      </fieldset>
      <fieldset class="grid">
        <button class="btn btn-primary" onClick={() => submit("general")}>
          {counter === 1 ? "Tell me a pun" : `Tell me ${counter} puns`}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {data.length > 0 && (
        <ul>
          {data.map((joke) => (
            <li>{joke}</li>
          ))}
        </ul>
      )}
    </>
  );
}
