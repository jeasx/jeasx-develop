import { jsxToString } from "jsx-async-runtime";
import PasswordList from "./PasswordList";
import { SETS, generatePassword } from "./generate";

/** Timers of the running matrix reveal, cleared before every re-render. */
let revealTimers = [];

/** Reads the controls, generates fresh passwords and renders them in the browser. */
async function render(form, { reveal = true } = {}) {
  const data = new FormData(form);
  const length = Number(data.get("length"));
  const sets = /** @type {string[]} */ (data.getAll("sets"));
  const container = document.getElementById("passwords");
  // Keep the length readout and the slider fill level in sync while dragging.
  /** @type {HTMLOutputElement} */
  const output = document.querySelector("output[for='length']");
  output.value = String(length);
  /** @type {HTMLInputElement} */
  const range = form.querySelector("input[name='length']");
  const min = Number(range.min);
  const max = Number(range.max);
  range.style.setProperty("--fill", `${((length - min) / (max - min)) * 100}%`);
  stopReveal();
  const status = document.getElementById("status");
  if (sets.length === 0) {
    container.innerHTML = "<p>Pick at least one character set.</p>";
    status.textContent = "Pick at least one character set.";
    return;
  }
  const passwords = Array.from({ length: 5 }, () => generatePassword({ length, sets }));
  const alphabetSize = sets.reduce((sum, set) => sum + SETS[set].length, 0);
  // Render the JSX component to HTML right in the browser.
  container.innerHTML = await jsxToString(
    <PasswordList passwords={passwords} length={length} alphabetSize={alphabetSize} />,
  );
  status.textContent = `Five new passwords with ${length} characters.`;
  if (reveal) {
    matrixReveal(container);
  }
}

/** Stops a running reveal, so no timers keep ticking on discarded rows. */
function stopReveal() {
  revealTimers.forEach((timer) => {
    clearInterval(timer);
    clearTimeout(timer);
  });
  revealTimers = [];
}

/**
 * Matrix-like reveal: every character flickers through random glyphs and
 * settles on its real value after a random delay, row by row.
 */
function matrixReveal(container) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const rows = container.querySelectorAll(".password-row");
  rows.forEach((row) => {
    row.querySelectorAll(".pin span").forEach((span) => {
      // The real character was rendered by jsxToString; grab it before shuffling.
      const final = span.textContent;
      span.classList.add("matrix");
      span.textContent = randomGlyph();
      const start = Math.random() * 300;
      const settle = start + 200 + Math.random() * 500;
      const timer = setInterval(() => {
        span.textContent = randomGlyph();
      }, 60);
      const done = setTimeout(() => {
        clearInterval(timer);
        span.textContent = final;
        span.classList.remove("matrix");
      }, settle);
      revealTimers.push(timer, done);
    });
  });
}

/** Glyphs the matrix reveal shuffles through before a character settles. */
const MATRIX_GLYPHS = "0123456789$#%?!/\\|*+-<>=?";

function randomGlyph() {
  return MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
}

// Any control change (slider, checkboxes) refreshes the passwords immediately,
// without the reveal animation, so dragging the slider stays smooth.
document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement) {
    const form = target.closest("#password-form");
    if (form instanceof HTMLFormElement) {
      render(form, { reveal: false });
    }
  }
});

// Submitting rolls with fresh randomness.
document.addEventListener("submit", (event) => {
  if (event.target instanceof HTMLFormElement && event.target.id === "password-form") {
    event.preventDefault();
    render(event.target);
  }
});

// Clicking a password row copies it, even after the list has been re-rendered.
document.addEventListener("click", async (event) => {
  // Element, not HTMLElement: clicks on the copy icon target SVG elements.
  if (!(event.target instanceof Element)) {
    return;
  }
  const row = event.target.closest("button[data-copy]");
  if (!(row instanceof HTMLButtonElement)) {
    return;
  }
  const status = document.getElementById("status");
  try {
    await navigator.clipboard.writeText(row.dataset.copy);
  } catch {
    row.title = "Copying failed - select the password and copy it manually";
    status.textContent = "Copying failed.";
    return;
  }
  // The copy icon flips to a checkmark for a moment.
  status.textContent = "Password copied.";
  row.classList.add("copied");
  setTimeout(() => row.classList.remove("copied"), 1500);
});
