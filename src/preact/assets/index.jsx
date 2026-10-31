/** @jsxImportSource preact */
import { render } from "preact";
import Components from "./components/$index";

function init(components) {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const name = el.dataset.component;
      // Only own keys, so names like "toString" don't pick up inherited functions.
      if (Object.hasOwn(components, name)) {
        const Component = components[name];
        const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
        // Using render instead of hydrate to avoid hydration mismatches.
        // For single components it is fast and avoids lots of headaches.
        render(<Component {...props} />, el);
      }
    }
  });
}

init(Components);
