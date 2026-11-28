// Shared by Preact, React, Vue, Svelte, Alpine and Lit. They render a real form, which posts to the
// server without JavaScript. Once their JavaScript runs, this handler takes over the submit:
// the component updates its list itself, and the change is saved in the background.
import { postForm } from "../@helpers/isomorphic";

/** Saves run one after another, so the server applies them in the same order. */
let queue = Promise.resolve();

/**
 * Takes over a submit and returns the submitted fields, including the pressed button.
 *
 * @param {SubmitEvent & { nativeEvent?: SubmitEvent }} event React passes its own event type.
 * @returns {Record<string, string>}
 */
export function submitForm(event) {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */ (event.currentTarget);
  const submitter = event.submitter ?? event.nativeEvent?.submitter;
  const input = Object.fromEntries(
    [...new FormData(form, submitter)].map(([key, value]) => [key, String(value)]),
  );
  queue = queue
    .then(() => postForm(input, form))
    .catch((error) => {
      console.error(error);
      // Out of sync with the server: show what it knows.
      location.reload();
    });
  if (input.add !== undefined) {
    /** @type {HTMLInputElement} */ (form.elements.namedItem("text")).value = "";
  }
  return input;
}
