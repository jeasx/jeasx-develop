import { createRoot } from "react-dom/client";
import Components from "./components/$index";

function init(components) {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const Component = components[el.dataset.component];
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      if (Component) {
        createRoot(el).render(<Component {...props} />);
      }
    }
  });
}

init(Components);
