import { jsxToString } from "jsx-async-runtime";
import { initialState, pause, start, step } from "./game";
import Hud from "./Hud";
import Scene from "./Scene";

// The server rendered the very same initial state.
let state = initialState();
let running = false;
let last = 0;
let best = 0;
/** Frames per second, counted over half a second of real rendered frames. */
let fps = 0;
let frames = 0;
let since = 0;
try {
  best = Number(localStorage.getItem("sky-fortress-best")) || 0;
} catch {}

const game = document.getElementById("game");
const screen = document.getElementById("screen");

/** Controls held right now, by keyboard or by the touch pad. */
const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
};

const active = () => state.status === "playing";

/** Renders scene and HUD with the JSX components and swaps them in. */
async function render() {
  screen.innerHTML = await jsxToString(
    <>
      <Scene state={state} />
      <Hud state={state} best={best} fps={running ? fps : 0} />
    </>,
  );
}

/** One animation frame: advance the game by the time that passed, then render. */
async function frame(now) {
  // Cap the step, so a stalled tab doesn't fly the ship through walls.
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  frames += 1;
  if (now - since >= 500) {
    fps = Math.round((frames * 1000) / (now - since));
    frames = 0;
    since = now;
  }
  state = step(state, input, dt);
  if (state.status === "over" && state.score > best) {
    best = Math.floor(state.score);
    try {
      localStorage.setItem("sky-fortress-best", String(best));
    } catch {}
  }
  // Wait for each render, so slow devices drop frames instead of piling them up.
  await render();
  if (active() || state.blasts.length) {
    requestAnimationFrame(frame);
  } else {
    running = false;
    render();
  }
}

function loop() {
  if (!running) {
    running = true;
    last = since = performance.now();
    frames = 0;
    requestAnimationFrame(frame);
  }
}

function toggle() {
  state = active() ? pause(state) : start(state);
  if (active()) {
    loop();
  } else if (!running) {
    render();
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
  " ": "fire",
};

function press(event, down) {
  if (event.target instanceof HTMLInputElement) {
    return;
  }
  // Let buttons handle their own activation.
  if (event.target instanceof HTMLButtonElement && (event.key === " " || event.key === "Enter")) {
    return;
  }
  const key = KEYS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (key) {
    event.preventDefault();
    input[key] = down;
    // Firing also launches a game that waits for the player.
    if (down && key === "fire" && (state.status === "ready" || state.status === "over")) {
      toggle();
    }
  } else if (down && (event.key === "Enter" || event.key === "p" || event.key === "Escape")) {
    event.preventDefault();
    if (event.key !== "Escape" || active()) {
      toggle();
    }
  }
}
document.addEventListener("keydown", (event) => press(event, true));
document.addEventListener("keyup", (event) => press(event, false));
// Release everything when the window loses focus, so no key gets stuck.
window.addEventListener("blur", () => Object.keys(input).forEach((key) => (input[key] = false)));

// The touch pad. Start acts on release instead of on "click": while the scene
// renders every frame, Safari on iOS would swallow the click. Keyboard
// activation fires a click without a pointer (detail 0), so that still counts.
const pad = document.getElementById("pad");
const isStart = (event) => /** @type {Element} */ (event.target).closest("[data-action=start]");
pad.addEventListener("pointerup", (event) => {
  if (event.button === 0 && isStart(event)) {
    toggle();
  }
});
pad.addEventListener("click", (event) => {
  if (event.detail === 0 && isStart(event)) {
    toggle();
  }
});
for (const button of pad.querySelectorAll("[data-key]")) {
  const key = /** @type {HTMLElement} */ (button).dataset.key;
  const hold = (down) => (event) => {
    event.preventDefault();
    input[key] = down;
    button.classList.toggle("held", down);
    if (down && key === "fire" && !active()) {
      toggle();
    }
  };
  button.addEventListener("pointerdown", hold(true));
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    button.addEventListener(type, hold(false));
  }
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

// A tap on the screen starts or pauses the game.
game.addEventListener("pointerup", (event) => {
  if (event.button === 0) {
    toggle();
  }
});

// Pause when the tab is hidden.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && active()) {
    toggle();
  }
});

render();
