import Alpine from "alpinejs";
import { submitForm } from "../form";
import { MAX_ITEMS, reduceForm } from "../shopping";

// The same list as Alpine component: the markup and the items of the cookie come from the
// server ("./AlpineList.jsx"), the logic from here. Submits are taken over like for the
// other versions ("../form.js").
Alpine.data("shoppingList", (initial) => ({
  items: initial,
  init() {
    // Alpine renders the items from its template, so the server copy has to go.
    this.$el.querySelectorAll("[data-ssr]").forEach((element) => element.remove());
  },
  get done() {
    return this.items.filter((item) => item.done).length;
  },
  get full() {
    return this.items.length >= MAX_ITEMS;
  },
  submit(event) {
    this.items = reduceForm(this.items, submitForm(event));
  },
}));

/** Called by the loader ("../index.js"). */
export function start() {
  Alpine.start();
}
