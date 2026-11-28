import { hydrate } from "svelte";
import ShoppingList from "./ShoppingList.svelte";

/** Called by the loader ("../index.js") with the server-rendered root. */
export function start(root) {
  hydrate(ShoppingList, { target: root, props: { initial: JSON.parse(root.dataset.props) } });
}
