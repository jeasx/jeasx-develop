/** @jsxImportSource react */
import { hydrateRoot } from "react-dom/client";
import Components from "./components/$index";

function init(components) {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const name = el.dataset.component;
      // Only own keys, so names like "toString" don't pick up inherited functions.
      if (Object.hasOwn(components, name)) {
        const Component = components[name];
        const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
        // The server rendered the same markup, so React only attaches its event handlers.
        hydrateRoot(el, <Component {...props} />);
      }
    }
  });
}

init(Components);
