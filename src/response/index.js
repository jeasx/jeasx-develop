const presets = /** @type {HTMLElement} */ (document.querySelector(".presets"));
const statusLine = /** @type {HTMLOutputElement} */ (document.getElementById("status"));
const body = /** @type {HTMLElement} */ (document.getElementById("body"));
const buttons = /** @type {NodeListOf<HTMLButtonElement>} */ (
  presets.querySelectorAll("[data-accept]")
);

for (const button of buttons) {
  button.addEventListener("click", () => send(button.dataset.accept));
}

/**
 * Requests the cities with the given Accept header and shows the answer.
 *
 * @param {string} accept
 */
async function send(accept) {
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.accept === accept));
  }
  statusLine.textContent = "Loading…";
  try {
    const response = await fetch(presets.dataset.url, { headers: { accept } });
    statusLine.textContent = `${response.status} ${response.statusText} · Content-Type: ${response.headers.get("content-type")}`;
    const text = await response.text();
    // Indent JSON for reading. textContent shows HTML as source instead of rendering it.
    body.textContent = response.headers.get("content-type")?.startsWith("application/json")
      ? JSON.stringify(JSON.parse(text), null, 2)
      : text;
  } catch (error) {
    statusLine.textContent = `Request failed: ${error.message}`;
    body.textContent = "";
  }
}

send("application/json");

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
