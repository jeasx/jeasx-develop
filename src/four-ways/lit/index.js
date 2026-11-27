import { LitElement, html } from "lit";
import { INITIAL, MAX_ITEMS, MAX_LENGTH, update } from "../shopping";

/** The same list as Lit web component. It renders in the browser only. */
class ShoppingList extends LitElement {
  static properties = { items: { state: true } };

  constructor() {
    super();
    this.items = INITIAL;
  }

  // Render into the light DOM, so the page styles apply like for the other versions.
  createRenderRoot() {
    return this;
  }

  change(action, id, text) {
    this.items = update(this.items, { action, id, text });
  }

  add(event) {
    event.preventDefault();
    const input = this.querySelector("input");
    this.change("add", undefined, input.value);
    input.value = "";
  }

  render() {
    const done = this.items.filter((item) => item.done).length;
    return html`
      <form class="fw-list" @submit=${this.add}>
        <div class="fw-add">
          <input
            placeholder="Add an item"
            maxlength=${MAX_LENGTH}
            aria-label="New item"
            ?disabled=${this.items.length >= MAX_ITEMS}
          />
          <button>Add</button>
        </div>
        <p class="fw-count">${done} of ${this.items.length} done</p>
        <ul>
          ${this.items.map(
            (item) => html`
              <li class=${item.done ? "fw-done" : ""}>
                <button
                  type="button"
                  class="fw-check"
                  aria-pressed=${String(item.done)}
                  @click=${() => this.change("toggle", item.id)}
                >
                  ${item.text}
                </button>
                <button
                  type="button"
                  class="fw-remove"
                  aria-label="Remove ${item.text}"
                  @click=${() => this.change("remove", item.id)}
                >
                  ×
                </button>
              </li>
            `,
          )}
        </ul>
        <button
          type="button"
          class="fw-clear"
          ?disabled=${done === 0}
          @click=${() => this.change("clear")}
        >
          Clear done
        </button>
      </form>
    `;
  }
}

customElements.define("shopping-list", ShoppingList);

/** Called by the loader ("../index.js"); defining the element is all it takes. */
export function start() {}
