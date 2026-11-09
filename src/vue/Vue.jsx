import { html } from "jsx-async-runtime";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import COMPONENTS from "./$components";

export default async function Vue({ component, ...props }) {
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!Object.hasOwn(COMPONENTS, component)) {
    throw new Error(`Unknown component "${component}".`);
  }
  const markup = await renderToString(createSSRApp(COMPONENTS[component], props));
  return (
    <div data-component={component} data-props={JSON.stringify(props)}>
      {html(markup)}
    </div>
  );
}
