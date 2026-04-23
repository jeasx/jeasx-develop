import { hydrate } from "svelte";
import COMPONENTS from "./components/$index";

document.querySelectorAll("[data-component]").forEach((target) => {
  if (target instanceof HTMLElement) {
    const component = COMPONENTS[target.dataset.component];
    const props = target.dataset.props ? JSON.parse(target.dataset.props) : {};
    if (component) {
      hydrate(component, { target, props });
    }
  }
});
