import { html } from "@arrow-js/core";
import COMPONENTS from "./components/$index";

document.querySelectorAll("[data-arrowjs]").forEach((el) => {
  if (el instanceof HTMLElement) {
    html`${COMPONENTS[el.dataset.arrowjs]()}`(el);
  }
});
