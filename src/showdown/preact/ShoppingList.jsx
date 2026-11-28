/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";
import { loadSession, saveSession } from "../session";
import { MAX_ITEMS, MAX_LENGTH, update } from "../shopping";

/** The same list as Preact component: rendered on the server, then hydrated in the browser. */
export default function ShoppingList({ initial }) {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState("");
  // Hydrate with the list of the server, then switch to the one saved in this session.
  useEffect(() => {
    const saved = loadSession("preact");
    if (saved) setItems(saved);
  }, []);
  // State updaters must be pure, so the list is saved here, not inside setItems.
  const change = (action, id) => {
    const next = update(items, { action, id, text });
    setItems(next);
    saveSession("preact", next);
  };
  const done = items.filter((item) => item.done).length;

  return (
    <form
      class="fw-list"
      onSubmit={(event) => {
        event.preventDefault();
        change("add");
        setText("");
      }}
    >
      <div class="fw-add">
        <input
          placeholder="Add an item"
          maxlength={MAX_LENGTH}
          aria-label="New item"
          value={text}
          onInput={(event) => setText(event.currentTarget.value)}
          disabled={items.length >= MAX_ITEMS}
        />
        <button>Add</button>
      </div>
      <p class="fw-count">
        {done} of {items.length} done
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.id} class={item.done ? "fw-done" : ""}>
            <button
              type="button"
              class="fw-check"
              aria-pressed={item.done}
              onClick={() => change("toggle", item.id)}
            >
              {item.text}
            </button>
            <button
              type="button"
              class="fw-remove"
              aria-label={`Remove ${item.text}`}
              onClick={() => change("remove", item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" class="fw-clear" disabled={done === 0} onClick={() => change("clear")}>
        Clear done
      </button>
    </form>
  );
}
