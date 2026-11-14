import { COLS, EYES_TICKS, ROWS, speed, WALLS } from "./game";

/** Wall tiles get a class per neighboring wall, so the outline only runs along open sides. */
function wallClass(x, y) {
  const wall = (dx, dy) => WALLS[y + dy]?.[x + dx] === "wall";
  return ["tile wall", wall(0, -1) && "n", wall(1, 0) && "e", wall(0, 1) && "s", wall(-1, 0) && "w"]
    .filter(Boolean)
    .join(" ");
}

/**
 * A character on the maze. Every tick renders new elements, so CSS transitions
 * can't help; instead each sprite plays a short animation from the tile it came
 * from (`from`) to its current tile when it is inserted. Going through the
 * tunnel, a copy slides out of one edge while the sprite slides in from beyond
 * the other one. Jumps back into the ghost house skip the animation.
 */
function Sprite({
  x,
  y,
  from,
  gap = 1,
  elapsed = 0,
  far = false,
  vars = "",
  class: className,
  label,
  children = undefined,
}) {
  let dx = from.x - x;
  let dy = from.y - y;
  const timing = `--gap: ${gap}; --elapsed: ${elapsed}${vars}`;
  if (dy === 0 && Math.abs(dx) === COLS - 1) {
    // Through the tunnel: enter from the tile beyond the opposite edge.
    const direction = Math.sign(dx);
    return (
      <>
        <div
          class={`sprite ${className} tunnel-exit`}
          style={`--x: ${from.x}; --y: ${y}; --dx: 0; --dy: 0; --tx: ${direction}; ${timing}`}
          aria-hidden="true"
        >
          {children}
        </div>
        <div
          class={`sprite ${className} tunnel-enter`}
          style={`--x: ${x}; --y: ${y}; --dx: ${-direction}; --dy: 0; ${timing}`}
          role="img"
          aria-label={label}
        >
          {children}
        </div>
      </>
    );
  }
  if (!far && Math.abs(dx) + Math.abs(dy) > 1) dx = dy = 0;
  return (
    <div
      class={`sprite ${className}`}
      style={`--x: ${x}; --y: ${y}; --dx: ${dx}; --dy: ${dy}; ${timing}`}
      role="img"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/** Where the eyes look, per direction. */
const LOOK = { up: "0, -2px", down: "0, 2px", left: "-2px, 0", right: "2px, 0" };

/**
 * A drone: a cheerful one-eyed robot with a propeller. In the game rules they
 * are called ghosts; a crystal overloads them and sends them into a panic.
 */
function Drone({ ghost, tick, frightened }) {
  const scared = frightened && !ghost.inHouse;
  // Blink white during the last ticks of the fright as a warning.
  const ending = scared && frightened < 12 && frightened % 2 === 0;
  return (
    <Sprite
      x={ghost.x}
      y={ghost.y}
      from={ghost.from}
      gap={ghost.gap}
      elapsed={tick - ghost.movedAt}
      far={ghost.eaten && ghost.inHouse}
      // Ticks until the body of an eaten ghost reforms, counted from the catch.
      vars={ghost.caught ? `; --reform: ${EYES_TICKS - (tick - ghost.caught.tick)}` : ""}
      class={[
        "drone",
        ghost.color,
        scared && "scared",
        ending && "ending",
        ghost.eaten && ghost.inHouse && "eaten",
      ]
        .filter(Boolean)
        .join(" ")}
      label={`Drone ${ghost.name}${scared ? " (overloaded)" : ""}`}
    >
      <span class="bot">
        <span class="prop" />
        <span class="eye" style={`--look: translate(${LOOK[ghost.dir]})`} />
        <span class="mouth" />
      </span>
    </Sprite>
  );
}

const POINTS_TICKS = 8;

/** The points for an eaten ghost float up from where it was caught. */
function Points({ ghost, tick }) {
  const caught = ghost.caught;
  if (!caught || tick - caught.tick >= POINTS_TICKS) return null;
  return (
    <div
      class="points"
      style={`--x: ${caught.x}; --y: ${caught.y}; --elapsed: ${tick - caught.tick}`}
      aria-hidden="true"
    >
      {caught.points}
    </div>
  );
}

const SPARKLE_TICKS = 8;
const STARS = 10;

/**
 * Magic stars bursting out of both tunnel openings after the player went
 * through. Like the ghosts, the burst resumes with a negative delay on every
 * render, so it plays over several ticks without restarting.
 */
function Sparkles({ y, elapsed }) {
  if (elapsed >= SPARKLE_TICKS) return null;
  return (
    <>
      {[0, COLS - 1].map((x) => (
        <div
          class="sparkles"
          style={`--x: ${x}; --y: ${y}; --elapsed: ${elapsed}; --side: ${x ? -1 : 1}`}
          aria-hidden="true"
        >
          {Array.from({ length: STARS }, (_, i) => (
            <i
              class="star"
              style={`--angle: ${(i / STARS) * 180 - 90}deg; --reach: ${1 + (i % 3) * 0.5}; --delay: ${(i % 4) * 0.08}`}
            >
              {i % 2 ? "✦" : "★"}
            </i>
          ))}
        </div>
      ))}
    </>
  );
}

/**
 * Renders the maze, the remaining gems and all characters for one tick.
 *
 * With the previous state, the player slides from its old tile. Ghosts may take
 * several ticks per tile, so they carry their own slide start in the state. The clock
 * (in ms) offsets looping animations, so they continue seamlessly across renders
 * instead of restarting with every new element.
 *
 * @param {{ state: ReturnType<typeof import("./game").initialState>, previous?: ReturnType<typeof import("./game").initialState>, clock?: number }} props
 */
export default function Maze({ state, previous = state, clock = 0 }) {
  const { player, ghosts, dots, frightened, tick } = state;
  const dying = state.status === "caught" || state.status === "over";
  return (
    <div
      class={`maze${frightened ? " frightened" : ""}${dying ? " dying" : ""}`}
      style={`--cols: ${COLS}; --rows: ${ROWS}; --tick: ${1000 / speed(state)}ms; --clock: ${-Math.round(clock)}ms`}
    >
      {WALLS.flatMap((row, y) =>
        row.map((tile, x) => {
          if (tile === "wall") return <div class={wallClass(x, y)} />;
          if (tile === "door") return <div class="tile door" />;
          const dot = dots[y * COLS + x];
          const edge = tile === "" && (x === 0 || x === COLS - 1);
          const tunnel = edge ? (x === 0 ? " tunnel west" : " tunnel east") : "";
          // Dots are drawn as gems, power pellets as crystals.
          const item = { dot: " gem", power: " crystal" }[dot] ?? "";
          return <div class={`tile${tunnel}${item}`} />;
        }),
      )}
      <Sprite
        x={player.x}
        y={player.y}
        from={previous.player}
        class={`player${state.status === "playing" ? " hopping" : ""}${dying ? " caught" : ""}`}
        label="Blip, that's you"
      >
        <span class="eyes" style={`--look: translate(${LOOK[player.dir]})`} />
      </Sprite>
      <Sparkles y={player.y} elapsed={tick - player.warpedAt} />
      {ghosts.map((ghost) => (
        <Drone ghost={ghost} tick={tick} frightened={frightened} />
      ))}
      {ghosts.map((ghost) => (
        <Points ghost={ghost} tick={tick} />
      ))}
    </div>
  );
}
