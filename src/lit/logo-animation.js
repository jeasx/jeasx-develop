import { AnimateController, animate, fade, flyBelow } from "@lit-labs/motion";
import { LitElement, css, html } from "lit";

export const styles = [
  css /*css*/ `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: #040424;
      cursor: pointer;
    }

    .letter {
      flex: 1;
      font-size: 20vw;
      text-align: center;
      will-change: transform;
      background: linear-gradient(
        0deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(9, 33, 121, 1) 35%,
        rgba(0, 212, 255, 1) 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .info {
      position: absolute;
      right: 2px;
      bottom: 2px;
    }
  `,
];

class MotionLit extends LitElement {
  static properties = {
    letters: { type: Array },
  };
  static styles = styles;

  lit = ["L", "I", "T"];

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
    this.addEventListener("click", () => this.clickHandler());
    this.letters = this.lit;
  }

  render() {
    const delayTime = this.duration / (this.letters.length * 2.5);
    return html`
      ${this.letters?.map(
        (letter, i) =>
          html`<span
            class="letter"
            ${animate({
              keyframeOptions: {
                delay: i * delayTime,
              },
              in: fade,
              out: flyBelow,
            })}
            >${letter}</span
          >`,
      )}
    `;
  }

  clickHandler() {
    if (this.controller.isAnimating) {
      this.controller.togglePlay();
    } else {
      this.changeLayout();
    }
  }

  changeLayout() {
    this.letters = this.letters.length ? [] : this.lit;
  }
}

customElements.define("logo-animation", MotionLit);
