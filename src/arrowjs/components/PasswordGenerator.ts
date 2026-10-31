import { component, html, reactive } from "@arrow-js/core";

const CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*_+-=?",
};

const LABELS = ["Weak", "Fair", "Good", "Strong", "Very strong"];
const COLORS = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];

function generate(
  length: number,
  lower: boolean,
  upper: boolean,
  digits: boolean,
  symbols: boolean,
): string {
  let pool = "";
  if (lower) pool += CHARS.lower;
  if (upper) pool += CHARS.upper;
  if (digits) pool += CHARS.digits;
  if (symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;

  // Use a cryptographically secure source, Math.random() is predictable.
  const random = crypto.getRandomValues(new Uint32Array(length));
  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[random[i] % pool.length];
  }
  return result;
}

function scoreStrength(
  length: number,
  lower: boolean,
  upper: boolean,
  digits: boolean,
  symbols: boolean,
): number {
  let score = 0;
  if (length >= 8) score++;
  if (length >= 16) score++;
  if (lower && upper) score++;
  if (digits) score++;
  if (symbols) score++;
  return Math.min(score, 4);
}

function charClass(ch: string): string {
  if (/[0-9]/.test(ch)) return "ch-num";
  if (/[^a-zA-Z0-9]/.test(ch)) return "ch-sym";
  return "";
}

export const PasswordGenerator = component(() => {
  const state = reactive({
    length: 20,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    password: "",
    copyLabel: "Copy",
  });

  let copyTimer = 0;

  const regenerate = () => {
    state.password = generate(state.length, state.lower, state.upper, state.digits, state.symbols);
    window.clearTimeout(copyTimer);
    state.copyLabel = "Copy";
  };

  regenerate();

  const strength = () =>
    scoreStrength(state.length, state.lower, state.upper, state.digits, state.symbols);

  const copy = async () => {
    try {
      // Fails e.g. without permission or outside of a secure context (https).
      await navigator.clipboard.writeText(state.password);
      state.copyLabel = "Copied!";
    } catch {
      state.copyLabel = "Copy failed";
    }
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      state.copyLabel = "Copy";
    }, 1500);
  };

  const handleLengthChange = (e: Event) => {
    state.length = Number((e.target as HTMLInputElement).value);
    regenerate();
  };

  return html /*html*/ `<div class="gen">
    <section class="gen-display">
      <code class="gen-password"
        >${() =>
          state.password
            .split("")
            .map((ch) => html /*html*/ `<span class="${charClass(ch)}">${ch}</span>`)}</code
      >
      <div class="gen-actions">
        <button class="gen-copy" @click="${copy}">${() => state.copyLabel}</button>
        <button class="gen-new" @click="${regenerate}">Regenerate</button>
      </div>
    </section>
    <div class="strength-meter">
      <div class="strength-bar">
        <div
          class="strength-fill"
          style="${() =>
            `width: ${((strength() + 1) / 5) * 100}%; background: ${COLORS[strength()]}`}"
        ></div>
      </div>
      <span class="strength-label" style="${() => `color: ${COLORS[strength()]}`}">
        ${() => LABELS[strength()]}
      </span>
    </div>
    <section class="gen-options">
      <label class="gen-length">
        <span>Length: <strong>${() => state.length}</strong></span>
        <input
          type="range"
          min="4"
          max="64"
          value="${() => state.length}"
          class="gen-range"
          @input="${handleLengthChange}"
        />
      </label>
      <div class="gen-toggles">
        <label class="gen-sw">
          <input
            type="checkbox"
            checked="${() => state.lower}"
            @change="${() => {
              state.lower = !state.lower;
              regenerate();
            }}"
          />
          <span class="gen-sw-track"></span>
          <span>Lowercase</span>
        </label>
        <label class="gen-sw">
          <input
            type="checkbox"
            checked="${() => state.upper}"
            @change="${() => {
              state.upper = !state.upper;
              regenerate();
            }}"
          />
          <span class="gen-sw-track"></span>
          <span>Uppercase</span>
        </label>
        <label class="gen-sw">
          <input
            type="checkbox"
            checked="${() => state.digits}"
            @change="${() => {
              state.digits = !state.digits;
              regenerate();
            }}"
          />
          <span class="gen-sw-track"></span>
          <span>Numbers</span>
        </label>
        <label class="gen-sw">
          <input
            type="checkbox"
            checked="${() => state.symbols}"
            @change="${() => {
              state.symbols = !state.symbols;
              regenerate();
            }}"
          />
          <span class="gen-sw-track"></span>
          <span>Symbols</span>
        </label>
      </div>
    </section>
  </div>`;
});
