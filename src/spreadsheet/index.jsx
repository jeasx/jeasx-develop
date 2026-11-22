// The server rendered the first sheet. From here on, the browser recalculates it with the
// same formula engine and re-renders the changed cells with the same <Value> component.
import { jsxToString } from "jsx-async-runtime";
import Value from "./Value";
import { evaluate, format } from "./formula";
import { COLS } from "./grid";

const form = /** @type {HTMLFormElement} */ (document.querySelector("form.sheet"));

/** The inputs hold the sheet, so there is no copy of it in JavaScript. */
const read = () => evaluate(Object.fromEntries(/** @type {any} */ (new FormData(form))));

let values = read();

// While typing: recalculate and re-render the cells whose values changed.
form.addEventListener("input", async () => {
  const previous = values;
  values = read();
  for (const cell of Object.keys(values)) {
    if (format(values[cell]) !== format(previous[cell])) {
      form.querySelector(`output[data-cell="${cell}"]`).outerHTML = await jsxToString(
        <Value cell={cell} value={values[cell]} changed />,
      );
    }
  }
});

// After editing a cell: save the sheet in the background, so it survives a reload.
form.addEventListener("change", () => {
  fetch("/spreadsheet", {
    method: "POST",
    body: new URLSearchParams(/** @type {any} */ (new FormData(form))),
  });
});

// Moving between cells like in a spreadsheet: Enter confirms a cell and moves down,
// the arrow keys move in their direction. Left and right only leave the cell when the
// cursor is at the start or end of the text, so they still work while editing.
// Leaving a cell fires "change", which saves the sheet.
/** @type {Record<string, [number, number]>} */
const MOVES = {
  Enter: [0, 1],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

form.addEventListener("keydown", (event) => {
  const input = event.target;
  const move = MOVES[event.key];
  if (!move || !(input instanceof HTMLInputElement)) return;
  const [dx, dy] = move;
  const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
  const atEnd = input.selectionStart === input.value.length;
  if ((dx < 0 && !atStart) || (dx > 0 && !atEnd)) return;
  event.preventDefault();
  const col = COLS[COLS.indexOf(input.name[0]) + dx];
  const next = col && form.elements.namedItem(col + (Number(input.name.slice(1)) + dy));
  if (next instanceof HTMLInputElement) next.focus();
  else if (event.key === "Enter") input.blur();
});
