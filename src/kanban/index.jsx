// The server rendered the first board. From here on, the browser re-renders changed columns
// with the same async <Column> component, but with a store that fetches from the API.
import { jsxToString } from "jsx-async-runtime";
import Column from "./Column";
import { browserStore } from "./store/browser";

const context = { store: browserStore };

// The board lives in a cookie, and every change answers with a new cookie. Two changes
// sent at the same time would both start from the old cookie, and the one answered last
// would undo the other: its card jumps back. So changes are sent one after another.
let queue = Promise.resolve();

/**
 * Sends a form to the API like the browser would without JavaScript,
 * then renders the columns which changed.
 * @param {FormData | URLSearchParams} data
 */
function send(data) {
  // Read the form now: it may be replaced by a re-render while waiting in the queue.
  const body = new URLSearchParams(/** @type {any} */ (data));
  const task = queue.then(async () => {
    const response = await fetch("/kanban/api", {
      method: "POST",
      headers: { accept: "application/json" },
      body,
    });
    if (!response.ok) {
      throw new Error(`Saving failed: ${response.status}`);
    }
    const { changed } = await response.json();
    await Promise.all(changed.map(render));
  });
  // A failed change must not block the ones after it.
  queue = task.catch(() => {});
  return task;
}

/** @param {string} status */
async function render(status) {
  const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
  column.outerHTML = await jsxToString.call(context, <Column status={status} />);
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.closest(".kanban-board")) {
    return;
  }
  event.preventDefault();
  // FormData with the submitter includes the clicked button, e.g. to="doing".
  const data = new FormData(form, /** @type {SubmitEvent} */ (event).submitter);
  form.querySelectorAll("button").forEach((button) => (button.disabled = true));
  send(data).catch((error) => {
    console.error(error);
    // Fall back to the plain form, which the server handles on its own.
    form.submit();
  });
});

// Drag and drop is only an extra: it sends the same fields as the arrow buttons.
document.addEventListener("dragstart", (event) => {
  const card = closest(event, ".kanban-card");
  if (card) {
    event.dataTransfer.setData("text/plain", card.dataset.id);
    event.dataTransfer.effectAllowed = "move";
  }
});

document.addEventListener("dragover", (event) => {
  const column = closest(event, ".kanban-column");
  if (column) {
    event.preventDefault();
    document
      .querySelectorAll(".drop-target")
      .forEach((other) => other.classList.remove("drop-target"));
    column.classList.add("drop-target");
  }
});

document.addEventListener("dragend", () => {
  document
    .querySelectorAll(".drop-target")
    .forEach((column) => column.classList.remove("drop-target"));
});

document.addEventListener("drop", (event) => {
  const column = closest(event, ".kanban-column");
  const id = event.dataTransfer.getData("text/plain");
  if (!column || !id) {
    return;
  }
  event.preventDefault();
  column.classList.remove("drop-target");
  send(new URLSearchParams({ id, to: column.dataset.status })).catch(console.error);
});

/**
 * The element around the event's target which matches the selector, if any.
 * @param {Event} event
 * @param {string} selector
 */
function closest(event, selector) {
  return event.target instanceof Element
    ? /** @type {HTMLElement | null} */ (event.target.closest(selector))
    : null;
}
