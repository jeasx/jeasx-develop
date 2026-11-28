/** @jsxImportSource react */
import { hydrateRoot } from "react-dom/client";
import ShoppingList from "./ShoppingList";

/** Called by the loader ("../index.js") with the server-rendered root. */
export function start(root) {
  hydrateRoot(root, <ShoppingList initial={JSON.parse(root.dataset.props)} />);
}
