const playground = /** @type {HTMLFormElement} */ (document.getElementById("negotiation"));
const input = /** @type {HTMLInputElement} */ (playground.elements.namedItem("accept"));
const statusLine = /** @type {HTMLOutputElement} */ (document.getElementById("status"));
const body = /** @type {HTMLElement} */ (document.getElementById("body"));

for (const button of document.querySelectorAll("[data-accept]")) {
  button.addEventListener("click", () => {
    input.value = /** @type {HTMLElement} */ (button).dataset.accept;
    playground.requestSubmit();
  });
}

playground.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLine.textContent = "Loading...";
  try {
    const response = await fetch(playground.action, { headers: { accept: input.value } });
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
});

playground.requestSubmit();
