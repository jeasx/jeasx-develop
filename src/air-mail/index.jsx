import { jsxToString } from "jsx-async-runtime";
import Actors from "./Actors";
import { chunkOf, initialState, pause, start, step } from "./game";
import Hud from "./Hud";
import { CHUNK, FIRST_CHUNKS, PLANE_X, SAMPLE } from "./shared";
import Sky from "./Sky";
import StreamInfo from "./StreamInfo";

// The server rendered the very same initial state and the first chunks of the course.
let state = initialState();
let running = false;
let last = 0;
let best = 0;
let fps = 0;
let frames = 0;
let since = 0;
try {
  best = Number(localStorage.getItem("air-mail-best")) || 0;
} catch {}

const game = document.getElementById("game");
const sky = document.getElementById("sky");
const terrain = document.getElementById("terrain");
const actors = document.getElementById("actors");
const status = document.getElementById("stream");
const seed = game.dataset.seed;
const day = game.dataset.day;

/** Chunks to keep loaded ahead of the screen. */
const AHEAD = 3;

/** The chunks of the course in the page, with the data the server attached to them. */
const chunks = new Map();
const firstChunks = terrain.innerHTML;

function register(element) {
  const zone = (value, id) => {
    if (!value) {
      return null;
    }
    const [x0, x1] = value.split(" ").map(Number);
    return { x0, x1, id };
  };
  const index = Number(element.dataset.index);
  chunks.set(index, {
    element,
    solid: element.dataset.solid.split(" ").map(Number),
    drop: zone(element.dataset.drop, index),
    strip: zone(element.dataset.strip, index),
  });
}

/** The landscape as the flight rules see it, built from the streamed chunks. */
const world = {
  solidAt(x) {
    const index = chunkOf(x);
    const chunk = chunks.get(index);
    if (!chunk) {
      return null;
    }
    const position = (x - index * CHUNK) / SAMPLE;
    const n = Math.floor(position);
    const a = chunk.solid[n];
    const b = chunk.solid[Math.min(n + 1, chunk.solid.length - 1)];
    return a + (b - a) * (position - n);
  },
  dropAt(x) {
    const zone = chunks.get(chunkOf(x))?.drop;
    return zone && x >= zone.x0 && x <= zone.x1 ? zone : null;
  },
  stripAt(x) {
    const zone = chunks.get(chunkOf(x))?.strip;
    return zone && x >= zone.x0 && x <= zone.x1 ? zone : null;
  },
};

/*
 * The stream of the course: one long response from the server, one chunk per
 * line. Lines that arrived are kept until the plane needs them, and the stream
 * is only read on when none are left, which lets the server render the next ones.
 */
let reader = null;
let reading = false;
let buffer = "";
let received = 0;
let loaded = FIRST_CHUNKS - 1;
let generation = 0;
// Telemetry for the panel below the game.
let streamStatus = "page";
let request = `GET course?seed=${seed}&from=${FIRST_CHUNKS}`;
let requests = 0;
let lastChunk = null;

/** Shows the state of the stream below the game, rendered with the same JSX as on the server. */
async function renderStream() {
  const indexes = [...chunks.keys()];
  status.innerHTML = await jsxToString(
    <StreamInfo
      status={streamStatus}
      request={request}
      first={Math.min(...indexes)}
      last={Math.max(...indexes)}
      chunk={lastChunk}
      total={received}
      requests={requests}
      buffered={buffer.split("\n").length - 1}
    />,
  );
}

/** Adds the next chunk to the landscape, reading on from the server if needed. */
async function pump() {
  if (reading) {
    return;
  }
  reading = true;
  const current = generation;
  try {
    while (!buffer.includes("\n")) {
      if (!reader) {
        request = `GET course?seed=${seed}&from=${loaded + 1}`;
        requests += 1;
        streamStatus = "connecting";
        renderStream();
        const response = await fetch(`course?seed=${seed}&from=${loaded + 1}`);
        request += ` → ${response.status}`;
        reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        buffer = "";
      }
      streamStatus = "streaming";
      const { value, done } = await reader.read();
      if (current !== generation) {
        return;
      }
      if (done) {
        // The server sends a limited number of chunks per request; ask for more.
        reader = null;
        continue;
      }
      buffer += value;
      received += value.length;
    }
    const end = buffer.indexOf("\n");
    terrain.insertAdjacentHTML("beforeend", buffer.slice(0, end));
    register(terrain.lastElementChild);
    loaded += 1;
    lastChunk = {
      index: loaded,
      biome: terrain.lastElementChild.classList[1],
      bytes: new TextEncoder().encode(buffer.slice(0, end)).length,
    };
    buffer = buffer.slice(end + 1);
    streamStatus = "idle";
    renderStream();
  } catch {
    reader = null;
    streamStatus = "error";
    renderStream();
  } finally {
    reading = false;
  }
}

/** Reads on while the course ahead is short, and drops the chunks behind the plane. */
function stream() {
  const camera = state.x - PLANE_X;
  if (loaded < chunkOf(camera) + AHEAD) {
    pump();
  }
  for (const [index, chunk] of chunks) {
    if (index < chunkOf(camera) - 1) {
      chunk.element.remove();
      chunks.delete(index);
      renderStream();
    }
  }
}

/** A new flight starts at the beginning of the course again. */
function restartCourse() {
  generation += 1;
  reader?.cancel().catch(() => {});
  reader = null;
  reading = false;
  buffer = "";
  chunks.clear();
  terrain.innerHTML = firstChunks;
  terrain.querySelectorAll(".chunk").forEach(register);
  loaded = FIRST_CHUNKS - 1;
  streamStatus = "page";
  request = `GET course?seed=${seed}&from=${FIRST_CHUNKS}`;
  lastChunk = null;
  renderStream();
}

terrain.querySelectorAll(".chunk").forEach(register);

/** Controls held right now, by keyboard or by the touch pad. */
const input = { up: false, down: false, left: false, right: false, drop: false };

const active = () => state.status === "playing";

/** Renders sky, plane and HUD with JSX; the streamed landscape only moves. */
async function render() {
  const camera = state.x - PLANE_X;
  terrain.setAttribute("transform", `translate(${-Math.round(camera * 10) / 10} 0)`);
  const [back, front] = await Promise.all([
    jsxToString(<Sky camera={camera} clock={state.clock} />),
    jsxToString(
      <>
        <Actors state={state} />
        <Hud state={state} best={best} fps={running ? fps : 0} day={day} />
      </>,
    ),
  ]);
  sky.innerHTML = back;
  actors.innerHTML = front;
}

/** One animation frame: fly on for the time that passed, stream on, then render. */
async function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  frames += 1;
  if (now - since >= 500) {
    fps = Math.round((frames * 1000) / (now - since));
    frames = 0;
    since = now;
  }
  state = step(state, input, dt, world);
  if (state.status === "over" && state.score > best) {
    best = state.score;
    try {
      localStorage.setItem("air-mail-best", String(best));
    } catch {}
  }
  stream();
  // Wait for each render, so slow devices drop frames instead of piling them up.
  await render();
  if (active()) {
    requestAnimationFrame(frame);
  } else {
    running = false;
    render();
  }
}

function toggle() {
  if (!active() && state.status !== "paused") {
    restartCourse();
  }
  state = active() ? pause(state) : start(state);
  if (active() && !running) {
    running = true;
    last = since = performance.now();
    frames = 0;
    requestAnimationFrame(frame);
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
  " ": "drop",
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
