import { html } from "@arrow-js/core";
import COMPONENTS from "./components/$index";

document.querySelectorAll("[data-arrowjs]").forEach((el) => {
  if (el instanceof HTMLElement) {
    const component = COMPONENTS[el.dataset.arrowjs];
    if (component) {
      html`${component()}`(el);
    }
  }
});
