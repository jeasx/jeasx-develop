// The list for the Jeasx and HTMX versions. Every button submits the form, so it works without
// JavaScript. With JavaScript, Jeasx renders this component again in the browser (see
// "./jeasx/index.jsx"), and htmx sends the form in the background and swaps in the server's list.
import { MAX_ITEMS, MAX_LENGTH } from "./shopping";

/**
 * @param {{ way: "jeasx" | "htmx", items: import("./shopping").Item[] }} props
 */
export default function ServerList({ way, items }) {
  const done = items.filter((item) => item.done).length;
  const htmx = way === "htmx" ? { "hx-post": "/four-ways/list", "hx-swap": "outerHTML" } : {};
  return (
    <form
      class="fw-list"
      id={`${way}-list`}
      method="post"
      action="/four-ways/list"
      data-state={way === "jeasx" ? JSON.stringify(items) : undefined}
      {...htmx}
    >
      <input type="hidden" name="way" value={way} />
      <div class="fw-add">
        <input
          name="text"
          placeholder="Add an item"
          maxlength={MAX_LENGTH}
          aria-label="New item"
          disabled={items.length >= MAX_ITEMS}
        />
        {/* The first button of the form, so Enter in the input adds an item. */}
        <button name="add" value="1">
          Add
        </button>
      </div>
      <p class="fw-count">
        {done} of {items.length} done
      </p>
      <ul>
        {items.map((item) => (
          <li class={item.done ? "fw-done" : ""}>
            <button
              name="toggle"
              value={item.id}
              class="fw-check"
              aria-pressed={item.done ? "true" : "false"}
            >
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
