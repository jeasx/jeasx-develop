// The list as Alpine markup: rendered by the server as a template, which Alpine fills in the
// browser. x-cloak hides it until then, as the template alone shows no items.
// JSX doesn't allow the dot of modifiers like "x-on:submit.prevent", so add() prevents itself.
import { MAX_LENGTH } from "../shopping";

export default function AlpineList() {
  return (
    <form class="fw-list" x-data="shoppingList" x-on:submit="add($event)" x-cloak>
      <div class="fw-add">
        <input
          placeholder="Add an item"
          maxlength={MAX_LENGTH}
          aria-label="New item"
          x-model="text"
          x-bind:disabled="full"
        />
        <button>Add</button>
      </div>
      <p class="fw-count" x-text="`${done} of ${items.length} done`" />
      <ul>
        <template x-for="item in items" x-bind:key="item.id">
          <li x-bind:class="{ 'fw-done': item.done }">
            <button
              type="button"
              class="fw-check"
              x-bind:aria-pressed="String(item.done)"
              x-on:click="change('toggle', item.id)"
              x-text="item.text"
            />
            <button
              type="button"
              class="fw-remove"
              x-bind:aria-label="`Remove ${item.text}`"
              x-on:click="change('remove', item.id)"
            >
              ×
            </button>
          </li>
        </template>
      </ul>
      <button
        type="button"
        class="fw-clear"
        x-bind:disabled="done === 0"
        x-on:click="change('clear')"
      >
        Clear done
      </button>
    </form>
  );
}
