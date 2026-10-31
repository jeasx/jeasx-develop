import { html } from "@arrow-js/core";
import COMPONENTS from "./components/$index";

document.querySelectorAll("[data-arrowjs]").forEach((el) => {
  if (el instanceof HTMLElement) {
    const name = el.dataset.arrowjs;
    // Only own keys, so names like "toString" don't pick up inherited functions.
    if (Object.hasOwn(COMPONENTS, name)) {
      html`${COMPONENTS[name]()}`(el);
    }
  }
});
