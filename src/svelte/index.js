import { hydrate } from "svelte";
import COMPONENTS from "./components/$index";

document.querySelectorAll("[data-component]").forEach((target) => {
  if (target instanceof HTMLElement) {
    const name = target.dataset.component;
    // Only own keys, so names like "toString" don't pick up inherited functions.
    if (Object.hasOwn(COMPONENTS, name)) {
      const props = target.dataset.props ? JSON.parse(target.dataset.props) : {};
      hydrate(COMPONENTS[name], { target, props });
    }
  }
});
