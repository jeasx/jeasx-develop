import { component, html, reactive } from "@arrow-js/core";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PomodoroTimer = component(() => {
  const state = reactive({
    mode: "work" as "work" | "break",
    remaining: WORK_SECONDS,
    running: false,
    sessions: 0,
  });

  let timer = 0;
  // Time when the current period ends. Browsers slow down timers in background tabs
  // (down to once per minute), so the remaining time is computed from the clock
  // instead of counting ticks.
  let endsAt = 0;

  const total = () => (state.mode === "work" ? WORK_SECONDS : BREAK_SECONDS);
  const progress = () => 1 - state.remaining / total();
  const minutes = () => String(Math.floor(state.remaining / 60)).padStart(2, "0");
  const seconds = () => String(state.remaining % 60).padStart(2, "0");

  const tick = () => {
    if (!state.running) return;
    state.remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    if (state.remaining <= 0) {
      state.running = false;
      if (state.mode === "work") {
        state.sessions++;
        state.mode = "break";
        state.remaining = BREAK_SECONDS;
      } else {
        state.mode = "work";
        state.remaining = WORK_SECONDS;
      }
      return;
    }
    timer = window.setTimeout(tick, 250);
  };

  const start = () => {
    if (state.running) return;
    state.running = true;
    endsAt = Date.now() + state.remaining * 1000;
    timer = window.setTimeout(tick, 250);
  };

  const pause = () => {
    state.running = false;
    window.clearTimeout(timer);
  };

  const reset = () => {
    pause();
    state.remaining = total();
  };

  const setMode = (mode: "work" | "break") => {
    pause();
    state.mode = mode;
    state.remaining = mode === "work" ? WORK_SECONDS : BREAK_SECONDS;
  };

  return html /*html*/ `<div class="timer" data-mode="${() => state.mode}">
    <nav class="timer-tabs">
      <button
        type="button"
        class="${() => `timer-tab${state.mode === "work" ? " timer-tab--on" : ""}`}"
        aria-pressed="${() => String(state.mode === "work")}"
        @click="${() => setMode("work")}"
      >
        Focus
      </button>
      <button
        type="button"
        class="${() => `timer-tab${state.mode === "break" ? " timer-tab--on" : ""}`}"
        aria-pressed="${() => String(state.mode === "break")}"
        @click="${() => setMode("break")}"
      >
        Break
      </button>
    </nav>
    <section class="timer-face">
      <svg class="timer-ring" viewBox="0 0 200 200" aria-hidden="true">
        <circle
          class="timer-ring__track"
          cx="100"
          cy="100"
          r="${RADIUS}"
          fill="none"
          stroke-width="8"
        />
        <circle
          class="timer-ring__fill"
          cx="100"
          cy="100"
          r="${RADIUS}"
          fill="none"
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="${() => CIRCUMFERENCE * (1 - progress())}"
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div class="timer-time">
        <span class="timer-digits" role="timer">${minutes}:${seconds}</span>
      </div>
    </section>
    <div class="timer-controls">
      <button type="button" class="timer-btn" @click="${() => (state.running ? pause() : start())}">
        ${() => (state.running ? "Pause" : "Start")}
      </button>
      <button type="button" class="timer-btn timer-btn--sec" @click="${reset}">Reset</button>
    </div>
    <p class="timer-sessions">
      ${() => state.sessions} ${() => (state.sessions === 1 ? "session" : "sessions")} completed
    </p>
  </div>`;
});
