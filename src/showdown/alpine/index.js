import Alpine from "alpinejs";
import { loadSession, saveSession } from "../session";
import { INITIAL, MAX_ITEMS, update } from "../shopping";

// The same list as Alpine component: the markup comes from the server ("./AlpineList.jsx"),
// the state and the logic from here.
Alpine.data("shoppingList", () => ({
  items: loadSession("alpine") ?? INITIAL,
  text: "",
  get done() {
    return this.items.filter((item) => item.done).length;
  },
  get full() {
    return this.items.length >= MAX_ITEMS;
  },
  change(action, id) {
    this.items = update(this.items, { action, id, text: this.text });
    saveSession("alpine", this.items);
  },
  add(event) {
    event.preventDefault();
    this.change("add");
    this.text = "";
  },
}));

/** Called by the loader ("../index.js"). */
export function start() {
  Alpine.start();
}
