/** @jsxImportSource react */
import { html } from "jsx-async-runtime";
import { renderToString } from "react-dom/server";
import COMPONENTS from "./$components";

export default function React({ component, ...props }) {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(COMPONENTS, component)) {
    throw new Error(`Unknown component "${component}".`);
  }
  const Component = COMPONENTS[component];
  return html(
    renderToString(
      <div data-component={component} data-props={JSON.stringify(props)}>
        <Component {...props} />
      </div>,
    ),
  );
}
