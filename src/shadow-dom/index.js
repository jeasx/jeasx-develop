// The server already rendered the shadow roots, so the element only adds behaviour.
customElements.define(
  "planet-card",
  class extends HTMLElement {
    connectedCallback() {
      const root = this.shadowRoot;
      if (!root) return; // Browser without Declarative Shadow DOM: leave the light DOM alone.
      const visits = root.querySelector("[part=visits]");
      const output = root.querySelector("output");
      root.querySelector("button").addEventListener("click", () => {
        output.value = String(Number(output.value) + 1);
        visits.hidden = false;
      });
    }
  },
);
