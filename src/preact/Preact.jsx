/** @jsxImportSource preact */
import { html } from "jsx-async-runtime";
import { render } from "preact-render-to-string";
import COMPONENTS from "./$components";

export default function Preact({ component, ...props }) {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(COMPONENTS, component)) {
    throw new Error(`Unknown component "${component}".`);
  }
  const Component = COMPONENTS[component];
  return html(
    render(
      <div data-component={component} data-props={JSON.stringify(props)}>
        <Component {...props} />
      </div>,
    ),
  );
}
