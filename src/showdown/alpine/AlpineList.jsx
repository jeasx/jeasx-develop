// The list as Alpine markup. The server renders it with the items of the cookie, so the form
// works without JavaScript; the x- attributes are ignored then. Alpine can't take over
// server-rendered items, it renders its own from the <template>. Both use the same <Item>:
// the server copies are skipped by Alpine ("x-ignore") and removed on start (see "./index.js").
import { MAX_ITEMS, MAX_LENGTH } from "../shopping";

/**
 * @param {{ items: import("../shopping").Item[] }} props
 */
export default function AlpineList({ items }) {
  const done = items.filter((item) => item.done).length;
  return (
    <form
      class="fw-list"
      method="post"
      action="/showdown/list"
      x-data={`shoppingList(${JSON.stringify(items)})`}
      x-on:submit="submit($event)"
    >
      <input type="hidden" name="framework" value="alpine" />
      <div class="fw-add">
        <input
          name="text"
          placeholder="Add an item"
          maxlength={MAX_LENGTH}
          aria-label="New item"
          disabled={items.length >= MAX_ITEMS}
          x-bind:disabled="full"
        />
        <button name="add" value="1">
          Add
        </button>
      </div>
      <p class="fw-count" x-text="`${done} of ${items.length} done`">
        {done} of {items.length} done
      </p>
      <ul>
        {items.map((item) => (
          <Item item={item} ssr />
        ))}
        <template x-for="item in items" x-bind:key="item.id">
          <Item />
        </template>
      </ul>
      <button
        name="clear"
        value="1"
        class="fw-clear"
        disabled={done === 0}
        x-bind:disabled="done === 0"
      >
        Clear done
      </button>
    </form>
  );
}

/**
 * One item with its server values and the Alpine bindings which replace them.
 *
 * @param {{ item?: import("../shopping").Item, ssr?: boolean }} props
 */
function Item({ item = { id: 0, text: "", done: false }, ssr = false }) {
  return (
    <li
      class={item.done ? "fw-done" : ""}
      x-bind:class="{ 'fw-done': item.done }"
      data-ssr={ssr}
      x-ignore={ssr}
    >
      <button
        name="toggle"
        value={item.id}
        x-bind:value="item.id"
        class="fw-check"
        aria-pressed={item.done ? "true" : "false"}
        x-bind:aria-pressed="String(item.done)"
        x-text="item.text"
      >
        {item.text}
      </button>
      <button
        name="remove"
        value={item.id}
        x-bind:value="item.id"
        class="fw-remove"
        aria-label={`Remove ${item.text}`}
        x-bind:aria-label="`Remove ${item.text}`"
      >
        ×
      </button>
    </li>
  );
}
