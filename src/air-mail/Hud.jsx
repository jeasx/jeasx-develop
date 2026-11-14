import { kilometers, PARCELS } from "./game";

const MESSAGES = {
  ready: ["Air mail", "Press Enter or tap Start, then hold ▲ to take off."],
  paused: ["Paused", "Press Enter to continue."],
  over: ["Game over", "Press Enter to fly again."],
};

/** Score, distance, mail, fuel and planes, plus hints and the overlay for every state but flying. */
export default function Hud({ state, best, fps = 0, day = "" }) {
  const message = MESSAGES[state.status];
  const fuel = Math.max(0, state.fuel);
  const hint =
    state.status === "playing" && state.crash <= 0
      ? state.landed && state.speed === 0
        ? state.fuel < 99.5
          ? "Refuelling…"
          : "Hold ▲ to take off"
        : fuel === 0
          ? "Out of fuel! Glide to an airstrip"
          : fuel < 25
            ? "Fuel low! Land on the next airstrip"
            : ""
      : "";
  return (
    <div class="hud-layer">
      <div class="hud">
        <div class="stat">
          <span>Score</span>
          <strong>{state.score}</strong>
        </div>
        <div class="stat">
          <span>Best</span>
          <strong>{Math.max(best, state.score)}</strong>
        </div>
        <div class="stat">
          <span>Distance</span>
          <strong>{kilometers(state).toFixed(1)} km</strong>
        </div>
        <div class="stat">
          <span>Mail</span>
          <strong class="mail">
            {"✉".repeat(state.parcels)}
            <em>{"✉".repeat(PARCELS - state.parcels)}</em>
          </strong>
        </div>
        <div class={`stat fuel ${fuel < 25 ? "low" : ""}`}>
          <span>Fuel</span>
          <i style={`--fuel: ${(fuel / 100).toFixed(3)}`} />
        </div>
        <div class="stat">
          <span>Planes</span>
          <strong class="planes">{"✈".repeat(Math.max(0, state.lives)) || "–"}</strong>
        </div>
      </div>
      {day && <div class="day">Course of {day}</div>}
      {hint && <div class="hint">{hint}</div>}
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
    </div>
  );
}
