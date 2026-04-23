import { renderToString } from "react-dom/server";
import Components from "./components/$index";

export default function React({ component, ...props }) {
  const Component = Components[component];
  return {
    html: renderToString(
      <div data-component={component} data-props={JSON.stringify(props)}>
        <Component {...props} />
      </div>,
    ),
  };
}
