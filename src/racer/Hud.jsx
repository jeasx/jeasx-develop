import { kmh } from "./game";

const MESSAGES = {
  ready: ["Ready to race?", "Press Space or tap Start."],
  paused: ["Paused", "Press Space to continue."],
  over: ["Time's up!", "Press Space to race again."],
};

/** Seconds as 0'12"34. */
function laptime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds % 60).toFixed(2).padStart(5, "0");
  return `${minutes}'${rest.replace(".", '"')}`;
}

/** Start lights: one red light per second of countdown, then green. */
function Lights({ state }) {
  const lit = state.status === "countdown" ? 3 - Math.ceil(state.countdown) + 1 : 0;
  const go = state.status === "playing" && state.clock < 1;
  if (!lit && !go) return null;
  return (
    <div class="lights" role="status" aria-label={go ? "Go!" : `${4 - lit}`}>
      {[1, 2, 3].map((n) => (
        <i class={go ? "green" : n <= lit ? "red" : ""} />
      ))}
    </div>
  );
}

/** Score board, timer, speedometer and the overlay for every state but racing. */
export default function Hud({ state, best }) {
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
          <strong>{Math.floor(Math.max(best, state.score))}</strong>
        </div>
        <div class={`stat time ${state.time < 10 ? "low" : ""}`}>
          <span>Time</span>
          <strong>{Math.ceil(state.time)}</strong>
        </div>
        <div class="stat">
          <span>Lap {state.lap}</span>
          <strong>{laptime(state.lapTime)}</strong>
        </div>
        <div class="stat">
          <span>Best lap</span>
          <strong>{state.bestLap ? laptime(state.bestLap) : "–"}</strong>
        </div>
      </div>
      <div class="speedo" aria-label={`${kmh(state)} km/h`}>
        <strong>{kmh(state)}</strong>
        <span>km/h</span>
        <i style={`--speed: ${(kmh(state) / 290).toFixed(3)}`} />
      </div>
      <Lights state={state} />
      {message && (
        <div class={`overlay ${state.status}`} role="status">
          <strong>{message[0]}</strong>
          <span>{message[1]}</span>
        </div>
      )}
    </>
  );
}
