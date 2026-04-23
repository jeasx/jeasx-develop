import { useState } from "preact/hooks";

export default function Jokes({ initial, api }) {
  const [counter, setCounter] = useState(initial);
  const [data, setData] = useState([]);

  async function submit(category) {
    setData(await (await fetch(`${api}/${category}?amount=${counter}`)).json());
  }

  return (
    <>
      <fieldset class="grid">
        <button
          class="btn btn-secondary"
          onClick={() => setCounter(counter - 1)}
          disabled={counter === 1}
        >
          -
        </button>
        <button
          class="btn btn-secondary"
          onClick={() => setCounter(counter + 1)}
          disabled={counter === 5}
        >
          +
        </button>
      </fieldset>
      <fieldset class="grid">
        <button class="btn btn-primary" onClick={() => submit("programming")}>
          Tell me {counter} nerd {counter === 1 ? "joke" : "jokes"}
        </button>
      </fieldset>
      <fieldset class="grid">
        <button class="btn btn-primary" onClick={() => submit("general")}>
          Tell me {counter} {counter === 1 ? "pun" : "puns"}
        </button>
      </fieldset>
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
