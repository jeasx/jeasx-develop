import { createSSRApp } from "vue";
import COMPONENTS from "./$components";

document.querySelectorAll("[data-component]").forEach((target) => {
  if (target instanceof HTMLElement) {
    const name = target.dataset.component;
    // Only own keys, so names like "toString" don't pick up inherited functions.
    if (Object.hasOwn(COMPONENTS, name)) {
      const props = target.dataset.props ? JSON.parse(target.dataset.props) : {};
      // createSSRApp reuses the server-rendered markup instead of rendering it again.
      createSSRApp(COMPONENTS[name], props).mount(target);
    }
  }
});
