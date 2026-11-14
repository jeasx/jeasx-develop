import { hydrate as hydrateSvelte } from "svelte";
import Rating from "./Rating.svelte";

const COMPONENTS = { Rating };

/** Called by the island loader ("../index.js") with the server-rendered root. */
export function hydrate(root, name, props) {
  if (!Object.hasOwn(COMPONENTS, name)) throw new Error(`Unknown component "${name}".`);
  hydrateSvelte(COMPONENTS[name], { target: root, props });
}
