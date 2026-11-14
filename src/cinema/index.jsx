// The server rendered the first page. From here on, the browser re-renders the parts
// which changed with the same async components, but with a store that fetches the API.
import { jsxToString } from "jsx-async-runtime";
import SeatMap from "./SeatMap";
import SeatRow from "./SeatRow";
import Summary from "./Summary";
import { ROWS } from "./screenings";
import { browserStore } from "./store/browser";

const context = { store: browserStore };

// Hides what only plain forms need, e.g. the "Show" button of the screening picker.
document.documentElement.classList.add("cinema-js");

/** @param {string} part e.g. "map", "summary" or "row:C" */
function componentOf(part) {
  if (part === "map") {
    return <SeatMap />;
  }
  if (part === "summary") {
    return <Summary />;
  }
  return <SeatRow row={part.slice(4)} />;
}

/** @param {string[]} parts */
async function render(parts) {
  // A new map already contains all rows.
  const todo = parts.includes("map") ? parts.filter((part) => !part.startsWith("row:")) : parts;
  const focused = document.activeElement?.getAttribute("value");
  await Promise.all(
    todo.map(async (part) => {
      const element = document.querySelector(`[data-part="${part}"]`);
      if (element) {
        element.outerHTML = await jsxToString.call(context, componentOf(part));
      }
    }),
  );
  // Keep the focus on the seat you just clicked, so keyboard users don't lose their place.
  if (focused) {
    /** @type {HTMLElement | null} */ (
      document.querySelector(`.seat[value="${focused}"]`)
    )?.focus();
  }
}

/**
 * Sends a form to the API like the browser would without JavaScript,
 * then renders the parts which changed.
 * @param {HTMLFormElement} form
 * @param {HTMLElement | null} submitter
 */
async function send(form, submitter) {
  const response = await fetch("/cinema/api", {
    method: "POST",
    headers: { accept: "application/json" },
    body: new URLSearchParams(/** @type {any} */ (new FormData(form, submitter))),
  });
  if (!response.ok) {
    throw new Error(`Saving failed: ${response.status}`);
  }
  const { changed } = await response.json();
  await render(changed);
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.closest(".cinema")) {
    return;
  }
  event.preventDefault();
  send(form, /** @type {SubmitEvent} */ (event).submitter).catch((error) => {
    console.error(error);
    // Fall back to the plain form, which the server handles on its own.
    form.submit();
  });
});

// With JavaScript, picking a screening needs no extra click on "Show".
document.addEventListener("change", (event) => {
  const select = event.target;
  if (select instanceof HTMLSelectElement && select.name === "screening") {
    select.form.requestSubmit();
  }
});

// Arrow keys move between the seats of the map.
document.addEventListener("keydown", (event) => {
  const seat = event.target;
  if (!(seat instanceof HTMLButtonElement) || !seat.classList.contains("seat")) {
    return;
  }
  const moves = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  };
  const move = moves[event.key];
  if (!move) {
    return;
  }
  event.preventDefault();
  const row = ROWS.indexOf(seat.value[0]) + move[0];
  const number = Number(seat.value.slice(1)) + move[1];
  /** @type {HTMLElement | null} */ (
    document.querySelector(`.seat[value="${ROWS[row]}${number}"]`)
  )?.focus();
});

// Other guests keep booking: refresh the seats and the summary every 20 seconds.
setInterval(() => {
  if (document.visibilityState === "visible") {
    render([...ROWS.map((row) => `row:${row}`), "summary"]).catch(console.error);
  }
}, 20_000);
