// The server rendered the first page. From here on, the browser handles every click
// with the same reducer and component. Only new jokes are fetched from the server.
import { mount } from "../@helpers/isomorphic";
import JokePicker from "./JokePicker";
import { reduce } from "./state";

/** @type {import("./state").Pick} */
async function pick(category, amount) {
  const response = await fetch(
    `/jokes/pick?${new URLSearchParams({ category, amount: String(amount) })}`,
  );
  if (!response.ok) {
    throw new Error(`Loading jokes failed: ${response.status}`);
  }
  return await response.json();
}

mount({
  root: "[data-jokes]",
  View: JokePicker,
  reduce: (state, input) => reduce(state, input, pick),
});
