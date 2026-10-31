/** @jsxImportSource react */
import { hydrateRoot } from "react-dom/client";
import Components from "./components/$index";

function init(components) {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const Component = components[el.dataset.component];
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      if (Component) {
        // The server rendered the same markup, so React only attaches its event handlers.
        hydrateRoot(el, <Component {...props} />);
      }
    }
  });
}

init(Components);
