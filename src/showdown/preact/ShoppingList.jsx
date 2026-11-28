/** @jsxImportSource preact */
import { useState } from "preact/hooks";
import { submitForm } from "../form";
import { MAX_ITEMS, MAX_LENGTH, reduceForm } from "../shopping";

/**
 * The same list as Preact component: rendered on the server from the cookie, then hydrated.
 * Without JavaScript, the form posts to the server like the Jeasx version.
 */
export default function ShoppingList({ initial }) {
  const [items, setItems] = useState(initial);
  const done = items.filter((item) => item.done).length;

  return (
    <form
      class="fw-list"
      method="post"
      action="/showdown/list"
      onSubmit={(event) => setItems(reduceForm(items, submitForm(event)))}
    >
      <input type="hidden" name="framework" value="preact" />
      <div class="fw-add">
        <input
          name="text"
          placeholder="Add an item"
          maxlength={MAX_LENGTH}
          aria-label="New item"
          disabled={items.length >= MAX_ITEMS}
        />
        <button name="add" value="1">
          Add
        </button>
      </div>
      <p class="fw-count">
        {done} of {items.length} done
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.id} class={item.done ? "fw-done" : ""}>
            <button name="toggle" value={item.id} class="fw-check" aria-pressed={item.done}>
              {item.text}
            </button>
            <button
              name="remove"
              value={item.id}
              class="fw-remove"
              aria-label={`Remove ${item.text}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button name="clear" value="1" class="fw-clear" disabled={done === 0}>
        Clear done
      </button>
    </form>
  );
}
