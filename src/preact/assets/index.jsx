import { render } from "preact";
import Components from "./components/$index";

function init(components) {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const Component = components[el.dataset.component];
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      if (Component) {
        // Using render instead of hydrate to avoid hydration mismatches.
        // For single components it is fast und avoids lots of headaches.
        render(<Component {...props} />, el);
      }
    }
  });
}

init(Components);
