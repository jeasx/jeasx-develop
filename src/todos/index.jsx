// The server rendered the first page. From here on, the browser handles every click
// with the same reducer and component, and only sends the form in the background,
// so the server can save the todos in the cookie.
import { mount, postForm } from "../@helpers/isomorphic";
import Todos from "./Todos";
import { navigate, reduce } from "./state";

/**
 * Renders the todos, passing the percentage the progress bar shows right now, so the bar
 * grows or shrinks from there instead of starting at 0 after every click.
 * @param {import("./state").State} state
 */
function View(state) {
  /** @type {HTMLElement | null} */
  const progress = document.querySelector("#app .progress");
  const from = Number.parseFloat(progress?.style.getPropertyValue("--percent") ?? "");
  return <Todos {...state} from={Number.isFinite(from) ? `${from}%` : undefined} />;
}

mount({ root: "#app", View, reduce, navigate, persist: postForm });
