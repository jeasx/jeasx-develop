import { render } from "svelte/server";
import COMPONENTS from "./components/$index";

export default function Svelte({ component, ...props }) {
  return (
    <div data-component={component} data-props={props}>
      {{ html: render(COMPONENTS[component], { props }).body }}
    </div>
  );
}
