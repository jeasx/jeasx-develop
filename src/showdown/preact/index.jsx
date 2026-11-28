/** @jsxImportSource preact */
import { hydrate } from "preact";
import ShoppingList from "./ShoppingList";

/** Called by the loader ("../index.js") with the server-rendered root. */
export function start(root) {
  hydrate(<ShoppingList initial={JSON.parse(root.dataset.props)} />, root);
}
