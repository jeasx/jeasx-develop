/**
 * Game rules for a maze chase: eat every dot, avoid the ghosts, and turn the
 * tables with a power pellet. The state is a plain object and `step` returns a
 * new state, so the same code runs on the server for the first frame and in
 * the browser for every tick.
 *
 * Tiles: # wall, . dot, o power pellet, - ghost door, _ void, space empty,
 * P player start, G ghost start.
 */
const MAZE = [
  "###################",
  "#o.......#.......o#",
  "#.##.###.#.###.##.#",
  "#.................#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "___#.#.......#.#___",
  "####.#.##-##.#.####",
  "    ...#GGG#...    ",
  "####.#.#####.#.####",
  "___#.#...P...#.#___",
  "####.#.#####.#.####",
  "#........#........#",
  "#.##.###.#.###.##.#",
  "#o.#...........#.o#",
  "##.#.#.#####.#.#.##",
  "#....#...#...#....#",
  "#.######.#.######.#",
  "#.................#",
  "###################",
];

export const COLS = MAZE[0].length;
export const ROWS = MAZE.length;

/** The tile right above the door, where ghosts leave the house. */
const EXIT = { x: 9, y: 7 };
const HOME = { x: 9, y: 9 };

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

const FRIGHTENED_TICKS = 40;
const DOT_POINTS = 10;
const POWER_POINTS = 50;
const GHOST_POINTS = 200;
/** Ticks the eyes of an eaten ghost need to fly back home. */
export const EYES_TICKS = 6;

/**
 * Each ghost has its own idea of where to go, so they surround the player
 * instead of forming a queue.
 */
const GHOSTS = [
  // Ticks until each ghost starts moving after a (re)start.
  { name: "Ember", color: "red", release: 10, aim: "chase" },
  { name: "Petal", color: "pink", release: 22, aim: "ambush" },
  { name: "Tide", color: "cyan", release: 40, aim: "flank" },
  { name: "Sunny", color: "orange", release: 60, aim: "shy" },
];

/** Static walls, doors and voids. Dots live in the state, since they get eaten. */
export const WALLS = MAZE.map((row) =>
  [...row].map((tile) =>
    tile === "#" ? "wall" : tile === "-" ? "door" : tile === "_" ? "void" : "",
  ),
);

function find(tile) {
  const result = [];
  MAZE.forEach((row, y) => [...row].forEach((t, x) => t === tile && result.push({ x, y })));
  return result;
}

/** Dots as a flat array, row by row: "dot", "power" or "". */
function freshDots() {
  return MAZE.flatMap((row) => [...row].map((t) => (t === "." ? "dot" : t === "o" ? "power" : "")));
}

function startPositions(state) {
  const [player] = find("P");
  const starts = find("G");
  return {
    ...state,
    player: { ...player, dir: "left", next: "left", warpedAt: -Infinity },
    ghosts: GHOSTS.map((ghost, i) => ({
      ...ghost,
      ...(i === 0 ? EXIT : starts[(i - 1) % starts.length]),
      dir: "left",
      inHouse: i !== 0,
      release: state.tick + ghost.release,
      eaten: false,
      energy: 0,
      gap: 1,
      // Where and when the last step started, for the slide animation.
      from: i === 0 ? EXIT : starts[(i - 1) % starts.length],
      movedAt: state.tick,
    })),
    frightened: 0,
    combo: 0,
  };
}

export function initialState() {
  return startPositions({
    dots: freshDots(),
    score: 0,
    lives: 3,
    level: 1,
    tick: 0,
    status: "ready",
  });
}

function wrap(x) {
  return (x + COLS) % COLS;
}

function walkable(x, y, ghostInHouse = false) {
  const tile = WALLS[y]?.[wrap(x)];
  if (tile === undefined) return false;
  if (tile === "door") return ghostInHouse;
  return tile === "";
}

function move(pos, dir) {
  const d = DIRECTIONS[dir];
  return { x: wrap(pos.x + d.x), y: pos.y + d.y };
}

function canMove(pos, dir, ghostInHouse) {
  const next = move(pos, dir);
  return walkable(next.x, next.y, ghostInHouse);
}

function movePlayer(player) {
  // A queued turn wins as soon as it fits, which makes cornering forgiving.
  const dir = canMove(player, player.next) ? player.next : player.dir;
  if (!canMove(player, dir)) return { ...player, dir };
  return { ...player, ...move(player, dir), dir };
}

function target(ghost, state) {
  const { player } = state;
  if (ghost.inHouse) return EXIT;
  const ahead = DIRECTIONS[player.dir];
  switch (ghost.aim) {
    case "ambush":
      return { x: player.x + ahead.x * 4, y: player.y + ahead.y * 4 };
    case "flank": {
      // Mirror the chaser through a point in front of the player.
      const chaser = state.ghosts[0];
      const pivot = { x: player.x + ahead.x * 2, y: player.y + ahead.y * 2 };
      return { x: 2 * pivot.x - chaser.x, y: 2 * pivot.y - chaser.y };
    }
    case "shy": {
      const far = (ghost.x - player.x) ** 2 + (ghost.y - player.y) ** 2 > 36;
      return far ? player : { x: 0, y: ROWS };
    }
    default:
      return player;
  }
}

/**
 * Ghost speed in tiles per tick, relative to the player: a bit slower at
 * first and closer with every level, crawling when frightened. Inside the
 * house they hurry out.
 */
function ghostSpeed(ghost, state) {
  if (ghost.inHouse) return 1;
  if (state.frightened) return 0.5;
  return Math.min(0.7 + state.level * 0.05, 0.95);
}

/**
 * Ghosts collect energy each tick and step one tile whenever they have a full
 * unit. `gap` says how many ticks pass until the next step, so the view can
 * stretch the slide over that time instead of pausing in between.
 */
function moveGhost(ghost, state) {
  // Waiting ghosts keep their state, so the eyes can finish their flight home.
  // The first one waits in front of the door, giving the player a head start.
  if (state.tick < ghost.release) return ghost;
  const rate = ghostSpeed(ghost, state);
  const energy = ghost.energy + rate;
  if (energy < 1) return { ...ghost, energy };
  ghost = { ...ghost, energy: energy - 1 };
  ghost.gap = Math.max(1, Math.ceil((1 - ghost.energy) / rate - 1e-9));
  return stepGhost(ghost, state);
}

function stepGhost(ghost, state) {
  const options = Object.keys(DIRECTIONS).filter(
    (dir) =>
      dir !== OPPOSITE[ghost.dir] &&
      canMove(ghost, dir, ghost.inHouse) &&
      // Only the player may wrap around through the tunnel.
      Math.abs(move(ghost, dir).x - ghost.x) <= 1,
  );
  // In a dead end, turning around is the only way out.
  if (options.length === 0) options.push(OPPOSITE[ghost.dir]);
  let dir;
  if (state.frightened && !ghost.inHouse) {
    dir = options[Math.floor(Math.random() * options.length)];
  } else {
    const goal = target(ghost, state);
    const distance = (d) => {
      const p = move(ghost, d);
      return (p.x - goal.x) ** 2 + (p.y - goal.y) ** 2;
    };
    dir = options.reduce((best, d) => (distance(d) < distance(best) ? d : best));
  }
  const pos = move(ghost, dir);
  const inHouse = ghost.inHouse && !(pos.x === EXIT.x && pos.y === EXIT.y);
  return {
    ...ghost,
    ...pos,
    dir,
    inHouse,
    from: { x: ghost.x, y: ghost.y },
    movedAt: state.tick,
  };
}

/** Resolves player/ghost contacts: either a ghost gets eaten or the player does. */
function collide(state) {
  let { ghosts, score, combo } = state;
  let caught = state.caught;
  ghosts = ghosts.map((ghost) => {
    if (ghost.x !== state.player.x || ghost.y !== state.player.y) return ghost;
    if (state.frightened && !ghost.inHouse) {
      combo++;
      const points = GHOST_POINTS * 2 ** (combo - 1);
      score += points;
      // The eyes fly home in EYES_TICKS, then the body reforms before release.
      return {
        ...ghost,
        ...HOME,
        inHouse: true,
        eaten: true,
        release: state.tick + EYES_TICKS + 6,
        from: { x: ghost.x, y: ghost.y },
        movedAt: state.tick,
        gap: EYES_TICKS,
        caught: { x: ghost.x, y: ghost.y, tick: state.tick, points },
      };
    }
    if (!ghost.inHouse) caught = true;
    return ghost;
  });
  return { ...state, ghosts, score, combo, caught };
}

/**
 * Advances the game by one tick.
 *
 * @param {ReturnType<typeof initialState>} state
 * @returns {ReturnType<typeof initialState>}
 */
export function step(state) {
  if (state.status !== "playing") return state;
  const tick = state.tick + 1;
  let player = movePlayer(state.player);
  // Remember when the player went through the tunnel, for the sparkles.
  if (Math.abs(player.x - state.player.x) > 1) player = { ...player, warpedAt: tick };
  const index = player.y * COLS + player.x;
  const eaten = state.dots[index];
  let { score, frightened, combo, ghosts } = state;
  if (eaten === "dot") score += DOT_POINTS;
  if (eaten === "power") {
    score += POWER_POINTS;
    frightened = FRIGHTENED_TICKS;
    combo = 0;
    // Ghosts turn around when they get scared.
    ghosts = ghosts.map((g) => (g.inHouse ? g : { ...g, dir: OPPOSITE[g.dir], eaten: false }));
  } else if (frightened) {
    frightened--;
  }
  const dots = eaten ? state.dots.with(index, "") : state.dots;

  // Check contacts after the player moved, which also catches swapped tiles,
  // and again after the ghosts moved.
  let next = collide({
    ...state,
    caught: false,
    tick,
    player,
    dots,
    score,
    ghosts,
    frightened,
    combo,
  });
  next = collide({ ...next, ghosts: next.ghosts.map((g) => moveGhost(g, next)) });

  if (next.caught) {
    // Freeze everyone where it happened; positions reset when play continues.
    const lives = next.lives - 1;
    return { ...next, lives, status: lives > 0 ? "caught" : "over" };
  }
  if (!dots.some(Boolean)) return { ...next, status: "cleared" };
  return next;
}

/** Starts or resumes play, moving on to the next level after a cleared maze. */
export function start(state) {
  if (state.status === "over") return { ...initialState(), status: "playing" };
  if (state.status === "cleared") {
    return startPositions({
      ...state,
      dots: freshDots(),
      level: state.level + 1,
      status: "playing",
    });
  }
  if (state.status === "caught") {
    return startPositions({ ...state, status: "playing" });
  }
  return { ...state, status: "playing" };
}

export function steer(state, dir) {
  return { ...state, player: { ...state.player, next: dir } };
}

/** Ticks per second, a little faster with every level. */
export function speed(state) {
  return Math.min(6 + state.level, 12);
}
