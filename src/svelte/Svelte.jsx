import { html } from "jsx-async-runtime";
import { render } from "svelte/server";
import COMPONENTS from "./components/$index";

export default function Svelte({ component, ...props }) {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(COMPONENTS, component)) {
    throw new Error(`Unknown component "${component}".`);
  }
  return (
    <div data-component={component} data-props={JSON.stringify(props)}>
      {html(render(COMPONENTS[component], { props }).body)}
    </div>
  );
}
