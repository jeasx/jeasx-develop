import { animate, fadeIn, flyBelow } from "@lit-labs/motion";
import { LitElement, css, html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";

const FRUITS = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍓",
  "🍍",
  "🥝",
  "🍑",
  "🍒",
  "🥥",
  "🍋",
  "🫐",
];
const MAX_ITEMS = FRUITS.length;

export const styles = [
  css /*css*/ `
    :host {
      display: block;
      border: 1px solid rgba(127, 127, 127, 0.2);
      border-radius: 1rem;
      background: rgba(127, 127, 127, 0.07);
      padding: 1.5rem;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    button {
      cursor: pointer;
      border: 1px solid rgba(127, 127, 127, 0.3);
      border-radius: 999px;
      background: transparent;
      padding: 0.45rem 1.1rem;
      color: inherit;
      font: inherit;
    }

    button:hover:not(:disabled) {
      border-color: #00e8ff;
    }

    button:disabled {
      cursor: default;
      opacity: 0.4;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      min-height: 4.5rem;
      list-style: none;
    }

    ul.column {
      grid-template-columns: 1fr;
      margin: 0 auto;
      max-width: 16rem;
    }

    li {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(
        135deg,
        rgba(0, 232, 255, 0.18),
        rgba(50, 79, 255, 0.3)
      );
      padding: 0.75rem;
      font-size: 1.75rem;
    }

    li small {
      opacity: 0.7;
      font-size: 0.8rem;
    }

    .empty {
      margin: 0;
      opacity: 0.6;
      text-align: center;
    }
  `,
];

class ListAnimation extends LitElement {
  static properties = {
    items: { state: true },
    column: { state: true },
  };
  static styles = styles;

  duration = 450;

  constructor() {
    super();
    this.items = FRUITS.slice(0, 6);
    this.column = false;
  }

  render() {
    return html`
      <div class="toolbar">
        <button @click=${this.shuffle} ?disabled=${this.items.length < 2}>
          🔀 Shuffle
        </button>
        <button @click=${this.sort} ?disabled=${this.items.length < 2}>
          ↕ Sort
        </button>
        <button @click=${() => (this.column = !this.column)}>
          ${this.column ? "▦ Grid" : "☰ List"}
        </button>
        <button @click=${this.add} ?disabled=${this.items.length === MAX_ITEMS}>
          ＋ Add
        </button>
        <button @click=${this.remove} ?disabled=${this.items.length === 0}>
          − Remove
        </button>
      </div>
      <ul class=${classMap({ column: this.column })}>
        ${repeat(
          this.items,
          (item) => item,
          (item) =>
            html`<li
              ${animate({
                keyframeOptions: { duration: this.duration, fill: "both" },
                in: fadeIn,
                out: flyBelow,
              })}
            >
              ${item}
              ${this.column ? html`<small>#${FRUITS.indexOf(item) + 1}</small>` : null}
            </li>`,
        )}
      </ul>
      ${this.items.length === 0 ? html`<p class="empty">The basket is empty.</p>` : null}
    `;
  }

  shuffle() {
    // Fisher-Yates: every order is equally likely (unlike sorting by Math.random()).
    const items = [...this.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    this.items = items;
  }

  sort() {
    this.items = this.items.toSorted(
      (a, b) => FRUITS.indexOf(a) - FRUITS.indexOf(b),
    );
  }

  add() {
    const missing = FRUITS.filter((fruit) => !this.items.includes(fruit));
    const fruit = missing[Math.floor(Math.random() * missing.length)];
    const at = Math.floor(Math.random() * (this.items.length + 1));
    this.items = this.items.toSpliced(at, 0, fruit);
  }

  remove() {
    const at = Math.floor(Math.random() * this.items.length);
    this.items = this.items.toSpliced(at, 1);
  }
}

customElements.define("list-animation", ListAnimation);
