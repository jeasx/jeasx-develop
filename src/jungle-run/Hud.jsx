import { TREASURE_COUNT } from "./game";

const MESSAGES = {
  ready: ["Jungle run", "Press Enter or tap Start."],
  paused: ["Paused", "Press Enter to continue."],
  over: ["Game over", "Press Enter to run again."],
  won: ["All treasures found!", "Press Enter to run again."],
};

/** Seconds as 2:05. */
function clock(seconds) {
  const s = Math.ceil(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Score, time, lives and treasures, plus the overlay for every state but running. */
export default function Hud({ state, best, fps = 0 }) {
  const message = MESSAGES[state.status];
  return (
    <>
      <div class="hud">
        <div class="stat">
          <span>Score</span>
          <strong>{Math.floor(state.score)}</strong>
        </div>
        <div class="stat">
          <span>Best</span>
          <strong>
            {Math.max(best, state.status === "playing" ? 0 : Math.floor(state.score))}
          </strong>
        </div>
        <div class={`stat ${state.time < 30 ? "low" : ""}`}>
          <span>Time</span>
          <strong>{clock(state.time)}</strong>
        </div>
        <div class="stat">
          <span>Lives</span>
          <strong class="lives">{"♥".repeat(Math.max(0, state.lives)) || "–"}</strong>
        </div>
        <div class="stat">
          <span>Treasure</span>
          <strong>
            {state.collected.length}/{TREASURE_COUNT}
          </strong>
        </div>
      </div>
      {fps > 0 && (
        <div class={`fps ${fps < 30 ? "low" : ""}`}>
          <strong>{fps}</strong> fps
        </div>
      )}
      {message && (
        <div class={`overlay ${state.status}`} role="status">
          <strong>{message[0]}</strong>
          <span>{message[1]}</span>
        </div>
      )}
    </>
  );
}
