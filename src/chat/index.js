const byId = (id) => /** @type {HTMLElement} */ (document.getElementById(id));

const list = byId("messages");
const chatForm = /** @type {HTMLFormElement} */ (byId("chat-form"));
const textInput = /** @type {HTMLInputElement} */ (
  chatForm.elements.namedItem("text")
);
const nameInput = /** @type {HTMLInputElement} */ (
  chatForm.elements.namedItem("name")
);
const MAX_MESSAGES = 50;

/**
 * Same formula as on the server, so a name keeps its colour.
 *
 * @param {string} name
 */
function hue(name) {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + /** @type {number} */ (char.codePointAt(0))) % 360;
  }
  return hash;
}

/**
 * @param {string} state "connecting", "open" or "closed"
 * @param {string} text
 */
function setStatus(state, text) {
  byId("status").dataset.state = state;
  byId("status").textContent = text;
}

/** @param {string} time */
function formatTime(time) {
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Show the server-rendered times in the visitor's time zone.
for (const time of list.querySelectorAll("time")) {
  time.textContent = formatTime(time.dateTime);
}
list.scrollTop = list.scrollHeight;

/**
 * Appends a message. textContent never interprets markup, so messages can't inject HTML.
 *
 * @param {{ id: number, name: string, text: string, time: string }} message
 */
function append({ id, name, text, time }) {
  // After a reconnect, a message may arrive twice.
  if (list.querySelector(`[data-id="${id}"]`)) {
    return;
  }
  list.querySelector(".empty")?.remove();

  const item = document.createElement("li");
  item.dataset.id = String(id);
  if (name === nameInput.value.trim()) {
    item.className = "own";
  }
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.style.setProperty("--hue", String(hue(name)));
  avatar.textContent = name.charAt(0).toUpperCase();
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const author = document.createElement("strong");
  author.textContent = name;
  const timeElement = document.createElement("time");
  timeElement.dateTime = time;
  timeElement.textContent = formatTime(time);
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.append(author, " ", timeElement, paragraph);
  item.append(avatar, bubble);

  // Only scroll down if the visitor hasn't scrolled up to read older messages.
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  list.append(item);
  while (list.children.length > MAX_MESSAGES) {
    list.firstElementChild?.remove();
  }
  if (atBottom) {
    list.scrollTop = list.scrollHeight;
  }
}

const chatEvents = new EventSource(`/chat/events?after=${list.dataset.lastId}`);
chatEvents.addEventListener("open", () => setStatus("open", "Connected"));
chatEvents.addEventListener("error", () =>
  setStatus("connecting", "Reconnecting..."),
);
chatEvents.addEventListener("message", (event) =>
  append(JSON.parse(event.data)),
);
chatEvents.addEventListener("presence", (event) => {
  const { count } = JSON.parse(event.data);
  byId("presence").textContent =
    `${count} ${count === 1 ? "person" : "people"} online`;
});
chatEvents.addEventListener("full", () => {
  chatEvents.close();
  setStatus("closed", "The chat is full. Please try again later.");
});

// Send messages without reloading the page. The new message arrives via the event stream.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  byId("error").textContent = "";
  try {
    const response = await fetch(chatForm.action, {
      method: "POST",
      headers: { accept: "application/json" },
      body: new URLSearchParams(/** @type {any} */ (new FormData(chatForm))),
    });
    const result = await response.json();
    if (result.error) {
      byId("error").textContent = result.error;
      return;
    }
    textInput.value = "";
    textInput.focus();
  } catch {
    byId("error").textContent = "Sending failed. Please try again.";
  }
});
