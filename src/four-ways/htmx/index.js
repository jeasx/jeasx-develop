import htmx from "htmx.org";

/** Called by the loader ("../index.js"): htmx may arrive after the page was parsed. */
export function start(root) {
  htmx.process(root);
}
