import { jsxToString } from "jsx-async-runtime";
import { initialState, pause, start, step } from "./game";
import Hud from "./Hud";
import Road from "./Road";

// The server rendered the very same initial state.
let state = initialState();
let running = false;
let last = 0;
let best = 0;
try {
  best = Number(localStorage.getItem("racer-best")) || 0;
} catch {}

const game = document.getElementById("game");
const screen = document.getElementById("screen");

/** Keys held right now, by keyboard or by the touch pad. */
const input = { up: false, down: false, left: false, right: false };

/** Renders road and HUD with the JSX components and swaps them in. */
async function render() {
  screen.innerHTML = await jsxToString(
    <>
      <Road state={state} />
      <Hud state={state} best={best} />
    </>,
  );
}

/** One animation frame: advance the race by the time that passed, then render. */
async function frame(now) {
  // Cap the step, so a stalled tab doesn't teleport the car.
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state = step(state, input, dt);
  if (state.score > best && state.status === "over") {
    best = Math.floor(state.score);
    try {
      localStorage.setItem("racer-best", String(best));
    } catch {}
  }
  // Wait for each render, so slow devices drop frames instead of piling them up.
  await render();
  if (state.status === "playing" || state.status === "countdown") requestAnimationFrame(frame);
  else {
    running = false;
    // The state may have changed during the render, e.g. by pausing.
    render();
  }
}

function toggle() {
  if (state.status === "playing" || state.status === "countdown") {
    state = pause(state);
  } else {
    state = start(state);
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }
  if (!running) render();
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

function press(event, down) {
  if (event.target instanceof HTMLInputElement) return;
  const key = KEYS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (key) {
    event.preventDefault();
    input[key] = down;
    // Stepping on the gas also starts a race that waits for the player.
    if (down && key === "up" && (state.status === "ready" || state.status === "over")) toggle();
  } else if (down && (event.key === " " || event.key === "Enter")) {
    // Let buttons handle their own activation.
    if (event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    toggle();
  }
}
document.addEventListener("keydown", (event) => press(event, true));
document.addEventListener("keyup", (event) => press(event, false));
// Release everything when the window loses focus, so no key gets stuck.
window.addEventListener("blur", () => Object.keys(input).forEach((key) => (input[key] = false)));

// The touch pad: pedals and steering work while a finger holds them down.
const pad = document.getElementById("pad");
// Start acts on release instead of on "click": while the road renders every
// frame, Safari on iOS would swallow the click, treating the changing page like
// content revealed by hovering. Keyboard activation fires a click without a
// pointer (detail 0), so that still counts.
const isStart = (event) => /** @type {Element} */ (event.target).closest("[data-action=start]");
pad.addEventListener("pointerup", (event) => {
  if (event.button === 0 && isStart(event)) toggle();
});
pad.addEventListener("click", (event) => {
  if (event.detail === 0 && isStart(event)) toggle();
});
for (const button of pad.querySelectorAll("[data-key]")) {
  const key = /** @type {HTMLElement} */ (button).dataset.key;
  const hold = (down) => (event) => {
    event.preventDefault();
    input[key] = down;
    button.classList.toggle("held", down);
    if (down && key === "up" && state.status !== "playing" && state.status !== "countdown")
      toggle();
  };
  button.addEventListener("pointerdown", hold(true));
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    button.addEventListener(type, hold(false));
  }
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

// A tap on the road starts or pauses the race.
game.addEventListener("pointerup", (event) => {
  if (event.button === 0) toggle();
});

// Pause when the tab is hidden.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && (state.status === "playing" || state.status === "countdown")) toggle();
});

render();
