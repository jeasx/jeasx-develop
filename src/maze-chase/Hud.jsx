const MESSAGES = {
  ready: ["Ready?", "Press Space or tap Start to play."],
  paused: ["Paused", "Press Space to continue."],
  caught: ["Caught!", "Press Space to try again."],
  cleared: ["Maze cleared!", "Press Space for the next level."],
  over: ["Game over", "Press Space to start a new game."],
};

/** Score board and the overlay message for every state except playing. */
export default function Hud({ state, best }) {
  const message = MESSAGES[state.status];
  return (
    <>
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
          <span>Level</span>
          <strong>{state.level}</strong>
        </div>
        <div class="stat lives" aria-label={`${state.lives} lives`}>
          <span>Lives</span>
          <strong>
            {Array.from({ length: state.lives }, () => (
              <i class="life" />
            ))}
          </strong>
        </div>
      </div>
      {message && (
        <div class={`overlay ${state.status}`} role="status">
          <strong>{message[0]}</strong>
          <span>{message[1]}</span>
        </div>
      )}
    </>
  );
}
