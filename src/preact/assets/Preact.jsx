import { render } from "preact-render-to-string";
import Components from "./components/$index";

export default function Preact({ component, ...props }) {
  const Component = Components[component];
  return {
    html: render(
      <div data-component={component} data-props={JSON.stringify(props)}>
        <Component {...props} />
      </div>,
    ),
  };
}
