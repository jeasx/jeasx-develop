import { H_MAX, H_MIN } from "./game";

const MESSAGES = {
  ready: ["Sky fortress", "Press Enter or tap Start."],
  paused: ["Paused", "Press Enter to continue."],
  over: ["Game over", "Press Enter to fly again."],
};

/** Score board, fuel gauge, altimeter and the overlay for every state but flying. */
export default function Hud({ state, best, fps = 0 }) {
  const message = MESSAGES[state.status];
  const altitude = (state.h - H_MIN) / (H_MAX - H_MIN);
  const fuel = Math.max(0, state.fuel);
  return (
    <>
      <div class="hud">
        <div class="stat">
          <span>Score</span>
          <strong>{Math.floor(state.score)}</strong>
        </div>
        <div class="stat">
          <span>Best</span>
          <strong>{Math.floor(Math.max(best, state.score))}</strong>
        </div>
        <div class="stat">
          <span>Ships</span>
          <strong class="ships">{"▲".repeat(Math.max(0, state.lives)) || "–"}</strong>
        </div>
        <div class={`stat fuel ${fuel < 25 ? "low" : ""}`}>
          <span>Fuel</span>
          <i style={`--fuel: ${(fuel / 100).toFixed(3)}`} />
        </div>
      </div>
      <div class="altimeter" aria-label={`Altitude ${Math.round(altitude * 100)}%`}>
        <span>Alt</span>
        <div>
          <i style={`--alt: ${altitude.toFixed(3)}`} />
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
