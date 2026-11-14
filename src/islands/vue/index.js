import { createSSRApp } from "vue";
import Tickets from "./Tickets.vue";

const COMPONENTS = { Tickets };

/** Called by the island loader ("../index.js") with the server-rendered root. */
export function hydrate(root, name, props) {
  if (!Object.hasOwn(COMPONENTS, name)) throw new Error(`Unknown component "${name}".`);
  // createSSRApp reuses the server-rendered markup instead of rendering it again.
  createSSRApp(COMPONENTS[name], props).mount(root);
}
