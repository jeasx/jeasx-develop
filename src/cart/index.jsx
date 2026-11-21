// The server rendered the first page. From here on, the browser previews every change of the
// cart with the same reducer and component, and saves it in the background. Discount codes
// and orders need the server: the browser sends them and renders the state it answers with.
import { mount, postForm } from "../@helpers/isomorphic";
import Cart from "./Cart";
import { isServerAction, reduce } from "./state";

/**
 * Renders the cart with the state shown right now, so the component can animate
 * only what changed, e.g. a new line or the total.
 * @param {import("./state").State} state
 */
function View(state) {
  /** @type {HTMLElement | null} */
  const app = document.querySelector("#app");
  const previous = app?.dataset.state ? JSON.parse(app.dataset.state) : undefined;
  return <Cart {...state} previous={previous} />;
}

/**
 * Lets the server apply a code or place an order, sending the items of the cart along.
 * @param {import("./state").State} state
 * @param {Record<string, string>} input
 * @returns {Promise<import("./state").State>}
 */
async function askServer(state, input) {
  const response = await fetch(location.pathname, {
    method: "POST",
    headers: { accept: "application/json" },
    body: new URLSearchParams({ ...input, cart: JSON.stringify(state.items) }),
  });
  if (!response.ok) {
    throw new Error(`Checkout failed: ${response.status}`);
  }
  return await response.json();
}

mount({
  root: "#app",
  View,
  reduce: (state, input) =>
    isServerAction(input) ? askServer(state, input) : reduce(state, input),
  // The server already saved codes and orders while answering them.
  persist: (input, form) => (isServerAction(input) ? Promise.resolve() : postForm(input, form)),
});
