const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));

const HISTORY = 60;
/** @type {number[]} */
const memoryHistory = [];
let received = 0;
/** @type {EventSource | null} */
let events = null;

/**
 * @param {string} state "connecting", "open" or "closed"
 * @param {string} text
 */
function setStatus(state, text) {
  $("status").dataset.state = state;
  $("status").textContent = text;
}

/** Updates a value and lets it flash if it changed. */
function show(id, value) {
  const element = $(id);
  if (element.textContent !== value) {
    element.textContent = value;
    element.classList.remove("flash");
    void element.offsetWidth; // Restart the animation.
    element.classList.add("flash");
  }
}

/** @param {number} seconds */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
}

/** Draws the heap history as a line scaled between its minimum and maximum. */
function drawMemory() {
  const min = Math.min(...memoryHistory);
  const range = Math.max(...memoryHistory) - min || 1;
  const offset = HISTORY - memoryHistory.length;
  const points = memoryHistory.map(
    (value, index) =>
      `${offset + index},${(1 - (value - min) / range).toFixed(3)}`,
  );
  $("memory-history").setAttribute("points", points.join(" "));
}

function connect() {
  setStatus("connecting", "Connecting...");
  events = new EventSource("/sse/events");
  events.addEventListener("open", () => setStatus("open", "Connected"));
  events.addEventListener("error", () =>
    setStatus("connecting", "Reconnecting..."),
  );
  events.addEventListener("stats", (event) => {
    const { time, uptime, memory, clients } = JSON.parse(event.data);
    show("time", time);
    show("uptime", formatDuration(uptime));
    show("memory", `${(memory / 1024 / 1024).toFixed(1)} MB`);
    show("clients", String(clients));

    memoryHistory.push(memory);
    if (memoryHistory.length > HISTORY) {
      memoryHistory.shift();
    }
    drawMemory();

    received++;
    $("received").textContent =
      `${received} ${received === 1 ? "event" : "events"} received`;
  });
  $("toggle").textContent = "Disconnect";
}

function disconnect() {
  events?.close();
  events = null;
  setStatus("closed", "Disconnected");
  $("toggle").textContent = "Connect";
}

$("toggle").addEventListener("click", () =>
  events ? disconnect() : connect(),
);

connect();
