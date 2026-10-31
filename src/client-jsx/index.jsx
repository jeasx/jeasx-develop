import { jsxToString } from "jsx-async-runtime";
import JokesHTML from "./components/JokesHTML";
import JokesJSON from "./components/JokesJSON";

const Components = { JokesHTML, JokesJSON };

globalThis.renderJSX = async (container, component, props = {}) => {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(Components, component)) {
    container.textContent = `Unknown component "${component}".`;
    return;
  }
  const Component = Components[component];
  container.innerHTML = await jsxToString(<Component {...props} />);
};
