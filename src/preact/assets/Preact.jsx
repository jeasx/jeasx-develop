/** @jsxImportSource preact */
import { html } from "jsx-async-runtime";
import { render } from "preact-render-to-string";
import Components from "./components/$index";

export default function Preact({ component, ...props }) {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(Components, component)) {
    throw new Error(`Unknown component "${component}".`);
  }
  const Component = Components[component];
  return html(
    render(
      <div data-component={component} data-props={JSON.stringify(props)}>
        <Component {...props} />
      </div>,
    ),
  );
}
