/** @jsxImportSource react */
import { hydrateRoot } from "react-dom/client";
import Questions from "./Questions";

// Schedule is only rendered on the server (hydrate="none"), so it isn't part of this bundle.
const COMPONENTS = { Questions };

/** Called by the island loader ("../index.js") with the server-rendered root. */
export function hydrate(root, name, props) {
  if (!Object.hasOwn(COMPONENTS, name)) throw new Error(`Unknown component "${name}".`);
  const Component = COMPONENTS[name];
  hydrateRoot(root, <Component {...props} />);
}
