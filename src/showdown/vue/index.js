import { createSSRApp } from "vue";
import ShoppingList from "./ShoppingList.vue";

/** Called by the loader ("../index.js") with the server-rendered root. */
export function start(root) {
  // createSSRApp reuses the server-rendered markup instead of rendering it again.
  createSSRApp(ShoppingList, { initial: JSON.parse(root.dataset.props) }).mount(root);
}
