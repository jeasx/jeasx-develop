import { html } from "jsx-async-runtime";
import { createElement as preactElement } from "preact";
import { render as preactToString } from "preact-render-to-string";
import { createElement as reactElement } from "react";
import { renderToString as reactToString } from "react-dom/server";
import { render as svelteToString } from "svelte/server";
import { createSSRApp } from "vue";
import { renderToString as vueToString } from "vue/server-renderer";
import Countdown from "./preact/Countdown";
import Questions from "./react/Questions";
import Schedule from "./react/Schedule";
import Rating from "./svelte/Rating.svelte";
import Tickets from "./vue/Tickets.vue";

/**
 * Server renderers per framework. Each one turns a component and its props into HTML.
 * The browser bundles in "./<framework>/index.*" hydrate the same components.
 */
const RENDERERS = {
  preact: {
    components: { Countdown },
    render: (component, props) => preactToString(preactElement(component, props)),
  },
  react: {
    components: { Questions, Schedule },
    render: (component, props) => reactToString(reactElement(component, props)),
  },
  svelte: {
    components: { Rating },
    render: (component, props) => svelteToString(component, { props }).body,
  },
  vue: {
    components: { Tickets },
    render: (component, props) => vueToString(createSSRApp(component, props)),
  },
};

/** When an island loads its JavaScript, see "./index.js". */
const STRATEGIES = new Set(["load", "idle", "visible", "interaction", "none"]);

/**
 * Renders a component of any framework on the server and marks it as an island.
 * With hydrate="none", the island is plain HTML and its framework never reaches the browser.
 *
 * @param {{ framework: keyof typeof RENDERERS, component: string, hydrate?: string, props?: Record<string, unknown> }} props
 */
export default async function Island({ framework, component, hydrate = "load", props = {} }) {
  const renderer = RENDERERS[framework];
  // Only own keys, so names like "toString" don't pick up inherited functions.
  if (!renderer || !Object.hasOwn(renderer.components, component)) {
    throw new Error(`Unknown component "${String(framework)}/${component}".`);
  }
  if (!STRATEGIES.has(hydrate)) {
    throw new Error(`Unknown hydration strategy "${hydrate}".`);
  }
  const markup = await renderer.render(renderer.components[component], props);
  const isStatic = hydrate === "none";
  return (
    <div
      class="island"
      data-framework={framework}
      data-hydrate={hydrate}
      data-state={isStatic ? "static" : "server"}
    >
      <p class="island-badge" aria-live="polite">
        <span class="island-framework">{framework}</span>
        <span class="island-strategy">{isStatic ? "no JavaScript" : `hydrate: ${hydrate}`}</span>
        <span class="island-status">{isStatic ? "static HTML" : "server HTML"}</span>
      </p>
      {/* Static islands need no root, props or component name in the browser. */}
      {isStatic ? (
        <div>{html(markup)}</div>
      ) : (
        <div class="island-root" data-component={component} data-props={props}>
          {html(markup)}
        </div>
      )}
    </div>
  );
}
