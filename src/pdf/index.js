// Progressive enhancement: without JavaScript, "Update preview" sends the form into the frame.
// With it, the preview follows every change after a short pause.
const form = /** @type {HTMLFormElement} */ (document.getElementById("invoice-form"));
const status = /** @type {HTMLElement} */ (document.getElementById("status"));
const frame = /** @type {HTMLIFrameElement} */ (document.querySelector(".pdf-viewer iframe"));

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer;

function update() {
  if (!form.reportValidity()) {
    return;
  }
  status.textContent = "Rendering…";
  // requestSubmit() honours the form's target and validation, like the button does.
  form.requestSubmit();
}

form.addEventListener("input", () => {
  clearTimeout(timer);
  status.textContent = "Editing…";
  timer = setTimeout(update, 500);
});

frame.addEventListener("load", () => {
  status.textContent = `Updated ${new Date().toLocaleTimeString("en-GB")}`;
});

document.documentElement.classList.add("pdf-live");

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
