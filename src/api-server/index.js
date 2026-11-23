import Prism from "prismjs";
import "prismjs/components/prism-json.js";

// Sends the request of a curl command with fetch() and shows the answer below it.
for (const command of document.querySelectorAll("[data-command]")) {
  const { method, body } = /** @type {HTMLElement} */ (command).dataset;
  const button = /** @type {HTMLButtonElement} */ (command.querySelector("[data-run]"));
  const output = /** @type {HTMLElement} */ (command.querySelector("[data-output]"));
  const status = /** @type {HTMLElement} */ (output.querySelector("[data-response-status]"));
  const headers = /** @type {HTMLElement} */ (output.querySelector("[data-response-headers]"));
  const json = /** @type {HTMLElement} */ (output.querySelector("[data-response-body]"));

  // The button needs JavaScript, so it only shows up once this script runs.
  button.hidden = false;
  button.addEventListener("click", async () => {
    button.disabled = true;
    const response = await fetch("books", {
      method,
      body,
      headers: body ? { "content-type": "application/json" } : {},
    });
    status.textContent = `${response.status} ${response.statusText}`;
    const allow = response.headers.get("allow");
    headers.textContent = allow ? `Allow: ${allow}` : "";
    json.textContent = JSON.stringify(await response.json(), null, 2);
    Prism.highlightElement(json);
    // Colors the status by its class: 2xx green, 4xx orange.
    output.dataset.status = String(response.status)[0];
    output.hidden = false;
    button.disabled = false;
  });
}
