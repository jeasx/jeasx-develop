const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
const room = $("room");

/** @type {Map<number, HTMLElement>} */
const cursors = new Map();
/** @type {WebSocket | null} */
let socket = null;
let sent = 0;
let received = 0;
let peers = 0;
let retry = 1000;
let pending = null;

function setStatus(state, text) {
  $("status").dataset.state = state;
  $("status").textContent = text;
}

function showCount(count) {
  peers = count;
  $("count").textContent = `${count} ${count === 1 ? "visitor" : "visitors"}`;
}

function showTraffic() {
  $("traffic").textContent = `${sent} sent · ${received} received`;
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    sent++;
    showTraffic();
  }
}

function addCursor({ id, name, color, x, y }) {
  const cursor = document.createElement("div");
  cursor.className = "ws-cursor";
  cursor.style.setProperty("--color", color);
  cursor.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1l5 14 2-6 6-2z"/></svg><span></span>`;
  /** @type {HTMLElement} */ (cursor.querySelector("span")).textContent = name;
  room.append(cursor);
  cursors.set(id, cursor);
  moveCursor(id, x, y);
}

function moveCursor(id, x, y) {
  const cursor = cursors.get(id);
  if (cursor) {
    cursor.hidden = x < 0;
    cursor.style.left = `${x * 100}%`;
    cursor.style.top = `${y * 100}%`;
  }
}

function ripple(x, y, color) {
  const element = document.createElement("div");
  element.className = "ws-ripple";
  element.style.left = `${x * 100}%`;
  element.style.top = `${y * 100}%`;
  element.style.setProperty("--color", color);
  element.addEventListener("animationend", () => element.remove());
  room.append(element);
}

function connect() {
  setStatus("connecting", "Connecting…");
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}/websocket/socket`);

  socket.addEventListener("open", () => {
    retry = 1000;
    setStatus("open", "Connected");
  });

  socket.addEventListener("message", (event) => {
    received++;
    showTraffic();
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "welcome":
        room.dataset.color = message.you.color;
        $("you").textContent = `You are ${message.you.name}.`;
        $("you").style.color = message.you.color;
        message.peers.forEach(addCursor);
        showCount(message.peers.length + 1);
        break;
      case "join":
        addCursor(message.peer);
        showCount(message.count);
        break;
      case "move":
        moveCursor(message.id, message.x, message.y);
        break;
      case "click": {
        const color = cursors.get(message.id)?.style.getPropertyValue("--color");
        ripple(message.x, message.y, color || room.dataset.color);
        break;
      }
      case "leave":
        cursors.get(message.id)?.remove();
        cursors.delete(message.id);
        showCount(message.count);
        break;
    }
  });

  socket.addEventListener("close", () => {
    socket = null;
    cursors.forEach((cursor) => cursor.remove());
    cursors.clear();
    setStatus("closed", `Disconnected, retrying in ${retry / 1000}s`);
    setTimeout(connect, retry);
    retry = Math.min(retry * 2, 30000);
  });
}

/** Converts a pointer event into fractions of the room's size. */
function position(event) {
  const rect = room.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

// Send at most one position per animation frame.
room.addEventListener("pointermove", (event) => {
  const first = pending === null;
  pending = position(event);
  if (first) {
    requestAnimationFrame(() => {
      if (peers > 1) {
        send({ type: "move", ...pending });
      }
      pending = null;
    });
  }
});

room.addEventListener("pointerleave", () => send({ type: "hide" }));

room.addEventListener("pointerdown", (event) => {
  send({ type: "click", ...position(event) });
});

connect();

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
