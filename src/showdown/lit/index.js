import { LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { submitForm } from "../form";
import { reduceForm } from "../shopping";
import { listTemplate } from "./template";

/**
 * The same list as Lit web component. Lit doesn't hydrate: the server renders the same
 * template as plain content of the element (see "./renderToString.js"), and Lit replaces it
 * with its live template once the element is defined.
 */
class ShoppingList extends LitElement {
  // The items come from the server as JSON in the "items" attribute.
  static properties = { items: { type: Array } };

  // Render into the light DOM, so the page styles apply like for the other versions.
  // Lit adds its template after existing content, so the server-rendered list is removed first.
  createRenderRoot() {
    this.replaceChildren();
    return this;
  }

  submit(event) {
    this.items = reduceForm(this.items, submitForm(event));
  }

  render() {
    return listTemplate({
      items: this.items,
      onSubmit: (event) => this.submit(event),
      each: repeat,
    });
  }
}

customElements.define("shopping-list", ShoppingList);

/** Called by the loader ("../index.js"); defining the element is all it takes. */
export function start() {}
