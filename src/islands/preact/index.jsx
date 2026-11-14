/** @jsxImportSource preact */
import { hydrate as hydratePreact } from "preact";
import Countdown from "./Countdown";

const COMPONENTS = { Countdown };

/** Called by the island loader ("../index.js") with the server-rendered root. */
export function hydrate(root, name, props) {
  if (!Object.hasOwn(COMPONENTS, name)) throw new Error(`Unknown component "${name}".`);
  const Component = COMPONENTS[name];
  hydratePreact(<Component {...props} />, root);
}
