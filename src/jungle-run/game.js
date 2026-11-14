/**
 * Game rules for a side-scrolling jungle run: the jungle is a ring of screens,
 * each with its own hazard, generated from the screen number alone. The
 * explorer runs, jumps, swings on vines and climbs down ladders into a tunnel
 * to collect every treasure before the time runs out. The state is a plain
 * object and `step` returns a new state, so the same code renders the first
 * frame on the server and runs every frame in the browser.
 */

export const WIDTH = 320;
export const HEIGHT = 180;
/** Height of the jungle floor, the tunnel ceiling and the tunnel floor. */
export const GROUND = 104;
export const CEILING = 124;
export const FLOOR = 164;
/** The ring of screens; walking off the last one leads to the first. */
export const SCREENS = 32;

/** Pits, crocodile ponds and tar pits all span the middle of a screen. */
export const POND = { from: 100, to: 220 };
export const HOLE = { from: 152, to: 168 };
export const LADDER_X = 160;
export const VINE = { x: 160, y: 20, length: 52 };
/** Crocodiles sit one running jump apart, so the explorer can hop from head to head. */
export const CROCS = [114, 161, 208];
export const TREASURE_X = 280;

const RUN = 70;
const CLIMB = 55;
/** How close to the ladder the explorer must be to grab it. */
const LADDER_REACH = 14;
const JUMP = 175;
const GRAVITY = 520;
const START_TIME = 180;
const START_SCORE = 2000;
const LIVES = 3;
/** How long a death takes: long enough for the ghost to float up to the treetops. */
export const DEATH_TIME = 2.4;
/** The explorer's hands are this far above the feet; they hold the vine. */
export const REACH = 24;

export const TREASURES = {
  gold: 5000,
  silver: 4000,
  ring: 5000,
  money: 2000,
};

/** A stable pseudo random number in [0, 1) for two integers. */
export function hash(a, b) {
  let h = Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Everything about one screen, derived from its number. */
export function screenAt(index) {
  if (index === 0) {
    return { hazard: "none", pit: "", vine: false, logs: [], treasure: null, wall: null };
  }
  const r = hash(index, 1);
  const hazard =
    r < 0.2 ? "hole" : r < 0.36 ? "logs" : r < 0.56 ? "pit" : r < 0.78 ? "croc" : "shift";
  const vine =
    hazard === "pit" || ((hazard === "croc" || hazard === "shift") && hash(index, 6) < 0.5);
  const logs = [];
  if (hazard === "hole" || hazard === "logs") {
    const count = 1 + Math.floor(hash(index, 7) * 3);
    const speed = hash(index, 8) < 0.65 ? 38 : 0;
    for (let i = 0; i < count; i++) {
      logs.push({ base: 250 - i * 34, speed });
    }
  }
  const kinds = Object.keys(TREASURES);
  const treasure = hash(index, 2) < 0.35 ? kinds[Math.floor(hash(index, 9) * kinds.length)] : null;
  const wall = hash(index, 3) < 0.4 ? (hash(index, 4) < 0.5 ? 34 : 286) : null;
  return {
    hazard,
    pit: hash(index, 5) < 0.5 ? "tar" : "water",
    vine,
    logs,
    treasure,
    wall,
  };
}

/** Number of screens with a treasure; collect them all to win. */
export const TREASURE_COUNT = Array.from({ length: SCREENS }, (_, i) => screenAt(i)).filter(
  (screen) => screen.treasure,
).length;

/** Where a log rolls right now; moving logs roll to the left and come back around. */
export function logX(log, clock) {
  const span = WIDTH + 40;
  return ((((log.base - clock * log.speed + 20) % span) + span) % span) - 20;
}

/** Half the width of a shifting tar pit, which opens and closes over time. */
export function shiftHalf(clock) {
  return 60 * Math.max(0, Math.sin(clock * 0.9));
}

/**
 * Crocodiles open their mouths now and then; an open mouth is deadly. Of every
 * 5.7 seconds they keep them shut for about 4, enough to hop across all three.
 */
export function crocOpen(clock) {
  return Math.sin(clock * 1.1) > 0.6;
}

/** The vine swings back and forth with the clock. */
export function vineAngle(clock) {
  return 0.8 * Math.sin(clock * 1.6);
}

export function vineTip(clock) {
  const angle = vineAngle(clock);
  return {
    x: VINE.x + VINE.length * Math.sin(angle),
    y: VINE.y + VINE.length * Math.cos(angle),
  };
}

/** What carries the explorer at x on the jungle floor: ground, a hole, a pit or a croc. */
function support(screen, x, clock) {
  const { hazard } = screen;
  const inPond = x > POND.from + 3 && x < POND.to - 3;
  if (hazard === "hole" && x > HOLE.from + 2 && x < HOLE.to - 2) {
    return "hole";
  }
  if (hazard === "pit" && inPond) {
    return "sink";
  }
  if (hazard === "shift" && Math.abs(x - LADDER_X) < shiftHalf(clock) - 3) {
    return "sink";
  }
  if (hazard === "croc" && inPond) {
    if (CROCS.some((c) => Math.abs(x - c) < 10)) {
      return crocOpen(clock) ? "croc" : "ground";
    }
    return "sink";
  }
  return "ground";
}

export function initialState(status = "ready") {
  return {
    status,
    clock: 0,
    time: START_TIME,
    score: START_SCORE,
    lives: LIVES,
    screen: 0,
    x: 24,
    y: GROUND,
    vx: 0,
    vy: 0,
    facing: 1,
    walk: 0,
    ground: true,
    under: false,
    climbing: false,
    vine: false,
    regrab: 0,
    trip: 0,
    dead: 0,
    cause: "",
    ghostX: 0,
    ghostY: 0,
    jumpWas: false,
    scorpion: 240,
    collected: [],
  };
}

function die(s, cause) {
  s.dead = DEATH_TIME;
  // The ghost rises from where the explorer died.
  s.ghostX = s.x;
  s.ghostY = s.y;
  s.cause = cause;
  s.vine = false;
  s.climbing = false;
  s.vx = 0;
  s.vy = 0;
  if (cause === "sink" || cause === "croc") {
    s.y = GROUND;
  }
}

/** After a death, the explorer drops in from the treetops at the left of the screen. */
function respawn(s) {
  s.lives -= 1;
  if (s.lives <= 0) {
    s.status = "over";
    return;
  }
  Object.assign(s, {
    x: 24,
    y: 30,
    vx: 0,
    vy: 0,
    under: false,
    ground: false,
    climbing: false,
    vine: false,
    cause: "",
    scorpion: 240,
  });
}

/** Advances the game by dt seconds with the controls held down. */
export function step(prev, input, dt) {
  if (prev.status !== "playing") {
    return prev;
  }
  const s = { ...prev };
  const screen = screenAt(s.screen);
  s.clock += dt;
  s.time = Math.max(0, s.time - dt);
  const pressed = input.jump && !prev.jumpWas;
  s.jumpWas = input.jump;

  if (s.time <= 0) {
    s.status = "over";
    return s;
  }
  if (s.dead > 0) {
    // The body stays where it fell while the ghost rises.
    s.dead -= dt;
    if (s.dead <= 0) {
      respawn(s);
    }
    return s;
  }

  s.regrab -= dt;
  s.trip -= dt;
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  if (s.vine) {
    const tip = vineTip(s.clock);
    s.x = tip.x;
    s.y = tip.y + REACH;
    if (dir) {
      s.facing = dir;
    }
    if (pressed || input.down) {
      // Let go: the swing carries the explorer on.
      const swing =
        0.8 * 1.6 * Math.cos(s.clock * 1.6) * VINE.length * Math.cos(vineAngle(s.clock));
      s.vine = false;
      s.regrab = 0.6;
      s.vx = Math.max(-RUN * 1.5, Math.min(RUN * 1.5, dir ? dir * RUN * 1.2 : swing));
      s.vy = pressed ? -90 : 0;
    }
  } else if (s.climbing) {
    s.walk += Math.abs((input.down ? 1 : 0) - (input.up ? 1 : 0)) * CLIMB * dt;
    s.y += ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * CLIMB * dt;
    if (s.y <= GROUND) {
      // Step off the ladder onto solid ground beside the hole, towards the arrow held.
      const side = dir || s.facing;
      Object.assign(s, {
        y: GROUND,
        x: LADDER_X + (side >= 0 ? 14 : -14),
        facing: side,
        climbing: false,
        under: false,
        ground: true,
      });
    } else if (s.y >= FLOOR) {
      Object.assign(s, { y: FLOOR, climbing: false, ground: true });
    }
  } else {
    if (s.ground) {
      s.vx = dir * RUN * (s.trip > 0 ? 0.35 : 1);
      if (dir) {
        s.facing = dir;
      }
      s.walk += Math.abs(s.vx) * dt;
    }
    // Pressing up near the ladder grabs it, even in the middle of a jump.
    const atLadder = screen.hazard === "hole" && Math.abs(s.x - LADDER_X) < LADDER_REACH;
    if (atLadder && s.under && input.up) {
      Object.assign(s, { climbing: true, x: LADDER_X, vx: 0, vy: 0, ground: false });
      return s;
    }
    if (s.ground && pressed) {
      s.vy = -JUMP;
      s.ground = false;
    }
    const before = s.x;
    s.vy += GRAVITY * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    if (s.under) {
      if (s.y < CEILING + REACH) {
        s.y = CEILING + REACH;
        s.vy = Math.max(0, s.vy);
      }
      if (screen.wall !== null && Math.abs(s.x - screen.wall) < 12) {
        s.x = before < screen.wall ? screen.wall - 12 : screen.wall + 12;
        s.vx = 0;
      }
    }

    s.ground = false;
    const floor = s.under ? FLOOR : GROUND;
    if (s.y >= floor) {
      const below = s.under ? "ground" : support(screen, s.x, s.clock);
      if (below === "hole") {
        s.under = true;
      } else if (below === "sink" || below === "croc") {
        die(s, below);
        return s;
      } else {
        s.y = floor;
        s.vy = 0;
        s.ground = true;
      }
    }

    if (!s.ground && !s.under && screen.vine && s.regrab <= 0) {
      const tip = vineTip(s.clock);
      // Anything from the feet up to the raised hands can catch the vine.
      if (Math.abs(s.x - tip.x) < 8 && tip.y > s.y - REACH - 6 && tip.y < s.y) {
        Object.assign(s, { vine: true, vx: 0, vy: 0 });
      }
    }
  }

  // Walk off a screen into the next one.
  if (s.x < 0 || s.x > WIDTH) {
    const left = s.x < 0;
    s.screen = (s.screen + (left ? -1 : 1) + SCREENS) % SCREENS;
    s.x += left ? WIDTH : -WIDTH;
    s.scorpion = left ? 60 : 260;
    return s;
  }

  // Rolling logs trip the explorer and cost points.
  if (!s.under && s.y > GROUND - 10) {
    for (const log of screen.logs) {
      if (Math.abs(s.x - logX(log, s.clock)) < 9 && s.trip <= 0) {
        s.trip = 0.5;
        s.score = Math.max(0, s.score - 100);
      }
    }
  }

  // A scorpion crawls through tunnels without walls towards the explorer.
  if (screen.wall === null) {
    if (s.under) {
      const gap = s.x - s.scorpion;
      s.scorpion += Math.sign(gap) * Math.min(Math.abs(gap), 16 * dt);
      if (Math.abs(gap) < 9 && s.y > FLOOR - 12) {
        die(s, "scorpion");
        return s;
      }
    }
  }

  if (
    screen.treasure &&
    !s.under &&
    !s.collected.includes(s.screen) &&
    Math.abs(s.x - TREASURE_X) < 10 &&
    s.y > GROUND - 14
  ) {
    s.collected = [...s.collected, s.screen];
    s.score += TREASURES[screen.treasure];
    if (s.collected.length === TREASURE_COUNT) {
      s.score += Math.floor(s.time) * 20;
      s.status = "won";
    }
  }
  return s;
}

export function start(state) {
  if (state.status === "paused") {
    return { ...state, status: "playing" };
  }
  if (state.status === "playing") {
    return state;
  }
  return initialState("playing");
}

export function pause(state) {
  return state.status === "playing" ? { ...state, status: "paused" } : state;
}
