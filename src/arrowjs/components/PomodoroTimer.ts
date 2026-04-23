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

  const total = () => (state.mode === "work" ? WORK_SECONDS : BREAK_SECONDS);
  const progress = () => 1 - state.remaining / total();
  const minutes = () => String(Math.floor(state.remaining / 60)).padStart(2, "0");
  const seconds = () => String(state.remaining % 60).padStart(2, "0");

  const tick = () => {
    if (!state.running) return;
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
    state.remaining--;
    timer = window.setTimeout(tick, 1000);
  };

  const start = () => {
    if (state.running) return;
    state.running = true;
    tick();
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

  return html /*html*/ `<main class="timer" data-mode="${() => state.mode}">
    <nav class="timer-tabs">
      <button
        class="${() => `timer-tab${state.mode === "work" ? " timer-tab--on" : ""}`}"
        @click="${() => setMode("work")}"
      >
        Focus
      </button>
      <button
        class="${() => `timer-tab${state.mode === "break" ? " timer-tab--on" : ""}`}"
        @click="${() => setMode("break")}"
      >
        Break
      </button>
    </nav>
    <section class="timer-face">
      <svg class="timer-ring" viewBox="0 0 200 200">
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
        <span class="timer-digits">${minutes}:${seconds}</span>
      </div>
    </section>
    <div class="timer-controls">
      <button class="timer-btn" @click="${() => (state.running ? pause() : start())}">
        ${() => (state.running ? "Pause" : "Start")}
      </button>
      <button class="timer-btn timer-btn--sec" @click="${reset}">Reset</button>
    </div>
    <p class="timer-sessions">
      ${() => state.sessions} ${() => (state.sessions === 1 ? "session" : "sessions")} completed
    </p>
  </main>`;
});
