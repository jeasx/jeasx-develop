import { jsxToString } from "jsx-async-runtime";
import { initialState, speed, start, steer, step } from "./game";
import Hud from "./Hud";
import Maze from "./Maze";

// The server rendered the very same initial state.
let state = initialState();
let timer = null;
// When the next tick is due, on a steady clock that doesn't drift with render time.
let due = 0;
let best = 0;
try {
  best = Number(localStorage.getItem("maze-chase-best")) || 0;
} catch {}

const game = document.getElementById("game");
const screen = document.getElementById("screen");

/** Renders HUD and maze with the JSX components and swaps them in. */
async function render(previous = state) {
  screen.innerHTML = await jsxToString(
    <>
      <Hud state={state} best={best} />
      <Maze state={state} previous={previous} clock={performance.now()} />
    </>,
  );
}

async function tick() {
  const previous = state;
  state = step(state);
  if (state.score > best) {
    best = state.score;
    try {
      localStorage.setItem("maze-chase-best", String(best));
    } catch {}
  }
  await render(previous);
  // Schedule against the steady clock, so each step takes exactly as long as the
  // slide animation. Wait for each render, so slow devices don't pile up ticks.
  if (state.status !== "playing") {
    timer = null;
    return;
  }
  due = Math.max(due + 1000 / speed(state), performance.now());
  timer = setTimeout(tick, due - performance.now());
}

function toggle() {
  if (state.status === "playing") {
    clearTimeout(timer);
    timer = null;
    state = { ...state, status: "paused" };
    render();
  } else {
    state = start(state);
    clearTimeout(timer);
    due = performance.now();
    tick();
  }
  game.focus();
}

const KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

/** @param {string} dir */
function turn(dir) {
  state = steer(state, dir);
  // Steering also starts a game that waits for the player.
  if (state.status === "ready" || state.status === "caught") toggle();
}

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  const dir = KEYS[event.key];
  if (dir) {
    event.preventDefault();
    turn(dir);
  } else if (event.key === " " || event.key === "Enter") {
    // Let buttons handle their own activation.
    if (event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    toggle();
  }
});

/** @param {Event} event */
function press(event) {
  const key = /** @type {Element} */ (event.target).closest("button");
  if (!key) return;
  if (key.dataset.action === "start") toggle();
  else if (key.dataset.dir) turn(key.dataset.dir);
}

// The pad acts on release instead of on "click": while the maze renders every
// tick, Safari on iOS would swallow the click, treating the changing page like
// content revealed by hovering. Keyboard activation fires a click without a
// pointer (detail 0), so that still counts.
const pad = document.getElementById("pad");
pad.addEventListener("pointerup", (event) => {
  if (event.button === 0) press(event);
});
pad.addEventListener("click", (event) => {
  if (event.detail === 0) press(event);
});

// Swipes on the maze steer, too.
let touch = null;
game.addEventListener("pointerdown", (event) => {
  touch = { x: event.clientX, y: event.clientY };
});
game.addEventListener("pointerup", (event) => {
  if (!touch) return;
  const dx = event.clientX - touch.x;
  const dy = event.clientY - touch.y;
  touch = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    if (state.status !== "playing") toggle();
    return;
  }
  turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
});

// Pause when the tab is hidden, so nobody gets caught while away.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.status === "playing") toggle();
});

render();
