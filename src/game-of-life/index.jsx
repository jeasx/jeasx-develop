import { jsxToString } from "jsx-async-runtime";
import Board from "./Board";
import { initialCells, randomCells, step } from "./life";
import Stats from "./Stats";

// The server rendered generation 0 from the same initial cells.
let cells = initialCells();
let generation = 0;
// Population of the last generations for the sparkline.
let history = [cells.filter(Boolean).length];
const HISTORY_LENGTH = 100;
let timer = null;

const container = document.getElementById("life");
const controls = document.getElementById("controls");
const playButton = controls.querySelector('[data-action="play"]');
const speed = /** @type {HTMLInputElement} */ (controls.querySelector('[name="speed"]'));

/** Renders the whole board with the JSX components and swaps it in. */
async function render(previous = cells) {
  const population = cells.filter(Boolean).length;
  // A new generation adds a point; painting only corrects the latest one.
  const kept = generation === 0 ? [] : previous === cells ? history.slice(0, -1) : history;
  history = [...kept, population].slice(-HISTORY_LENGTH);
  container.innerHTML = await jsxToString(
    <>
      <Board cells={cells} previous={previous} />
      <Stats generation={generation} history={history} />
    </>,
  );
}

async function tick() {
  const previous = cells;
  cells = step(cells);
  generation++;
  await render(previous);
}

function play() {
  // Wait for each render before scheduling the next one, so slow devices don't pile up ticks.
  const loop = async () => {
    await tick();
    if (timer) timer = setTimeout(loop, 1000 / Number(speed.value));
  };
  timer = setTimeout(loop, 0);
  playButton.textContent = "⏸ Pause";
}

function pause() {
  clearTimeout(timer);
  timer = null;
  playButton.textContent = "▶ Play";
}

/**
 * Runs the action of a control button.
 *
 * @param {Event} event
 */
async function control(event) {
  const button = /** @type {Element} */ (event.target).closest("[data-action]");
  if (!(button instanceof HTMLElement)) return;
  switch (button.dataset.action) {
    case "play":
      if (timer) pause();
      else play();
      break;
    case "step":
      pause();
      await tick();
      break;
    case "random":
      cells = randomCells();
      generation = 0;
      await render();
      break;
    case "clear":
      pause();
      cells = cells.map(() => false);
      generation = 0;
      await render();
      break;
  }
}

// Taps and clicks act on release instead of on "click": while the board renders
// several times per second, Safari on iOS would swallow the click, treating the
// changing page like content revealed by hovering. Keyboard activation of a
// button fires a click without a pointer (detail 0), so that still counts.
controls.addEventListener("pointerup", (event) => {
  if (event.button === 0) control(event);
});
controls.addEventListener("click", (event) => {
  if (event.detail === 0) control(event);
});

// Painting: pressing the mouse button on a cell toggles it, and moving over other cells
// while the button is held gives them the same state. During the stroke only the touched
// buttons are updated; the board is rendered again with JSX once the button is released.
/** @type {boolean | null} */
let paint = null;

/**
 * @param {number} x
 * @param {number} y
 */
function paintAt(x, y) {
  const cell = document.elementFromPoint(x, y)?.closest(".board .cell");
  if (!(cell instanceof HTMLElement)) return;
  const index = Number(cell.dataset.index);
  if (cells[index] === paint) return;
  cells = cells.with(index, paint);
  cell.classList.toggle("alive", paint);
  cell.setAttribute("aria-pressed", String(paint));
}

container.addEventListener("pointerdown", (event) => {
  const cell = /** @type {Element} */ (event.target).closest(".cell");
  if (!(cell instanceof HTMLElement) || event.button !== 0) return;
  event.preventDefault();
  paint = !cells[Number(cell.dataset.index)];
  paintAt(event.clientX, event.clientY);
});

// Listen on the document, so the stroke continues (and ends) outside the board.
document.addEventListener("pointermove", (event) => {
  if (paint !== null) paintAt(event.clientX, event.clientY);
});

document.addEventListener("pointerup", endStroke);
document.addEventListener("pointercancel", endStroke);

async function endStroke() {
  if (paint === null) return;
  paint = null;
  await render();
}

// Keyboard users toggle a cell with Enter or Space, which fires a click without a pointer.
container.addEventListener("click", async (event) => {
  const cell = /** @type {Element} */ (event.target).closest(".cell");
  if (!(cell instanceof HTMLElement) || event.detail !== 0) return;
  const index = Number(cell.dataset.index);
  cells = cells.with(index, !cells[index]);
  await render();
  // The board was replaced, so move the focus to the new button for keyboard users.
  /** @type {HTMLElement} */ (container.querySelector(`[data-index="${index}"]`)).focus();
});
