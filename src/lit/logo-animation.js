import { AnimateController, animate, fade, flyBelow } from "@lit-labs/motion";
import { LitElement, css, html } from "lit";

export const styles = [
  css /*css*/ `
    :host {
      display: block;
      border-radius: 1rem;
      cursor: pointer;
      user-select: none;
    }

    :host(:focus-visible) {
      outline: 2px solid #00e8ff;
      outline-offset: 4px;
    }

    .letters {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 1.3em;
      overflow: hidden;
      font-weight: 800;
      font-size: clamp(3.5rem, 16vw, 9rem);
      line-height: 1.3;
    }

    .letter {
      will-change: transform;
      background: linear-gradient(180deg, #00e8ff 0%, #324fff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .hint {
      margin: 0;
      padding-bottom: 1rem;
      opacity: 0.6;
      font-size: 0.85rem;
      text-align: center;
    }
  `,
];

class LogoAnimation extends LitElement {
  static properties = {
    text: { type: String },
    letters: { state: true },
    paused: { state: true },
  };
  static styles = styles;

  duration = 1000;
  controller = new AnimateController(this, {
    defaultOptions: {
      keyframeOptions: {
        duration: this.duration,
        fill: "backwards",
      },
    },
    onComplete: () => this.changeLayout(),
  });

  constructor() {
    super();
    /** @type {string} */
    this.text = "";
    this.letters = [];
    this.paused = false;
    this.addEventListener("click", () => this.toggle());
    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggle();
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // The whole element acts as a button, so make it reachable by keyboard.
    this.tabIndex = 0;
    this.setAttribute("role", "button");
    this.setAttribute(
      "aria-label",
      `${this.text} logo animation, press to pause or play`,
    );
  }

  /** @param {import("lit").PropertyValues<this>} changed */
  willUpdate(changed) {
    if (changed.has("text")) {
      this.letters = [...this.text];
    }
  }

  render() {
    const delayTime = this.duration / (this.text.length * 2.5);
    return html`
      <div class="letters" aria-hidden="true">
        ${this.letters.map(
          (letter, i) =>
            html`<span
              class="letter"
              ${animate({
                keyframeOptions: { delay: i * delayTime },
                in: fade,
                out: flyBelow,
              })}
              >${letter}</span
            >`,
        )}
      </div>
      <p class="hint">
        ${this.paused ? "▶ Paused, click to play" : "⏸ Click to pause"}
      </p>
    `;
  }

  toggle() {
    if (this.controller.isAnimating) {
      this.controller.togglePlay();
      this.paused = !this.paused;
    } else {
      this.paused = false;
      this.changeLayout();
    }
  }

  changeLayout() {
    this.letters = this.letters.length ? [] : [...this.text];
  }
}

customElements.define("logo-animation", LogoAnimation);
