/**
 * Game rules for an isometric shooter in the style of the early eighties: a
 * ship flies forward over a floating fortress, dodges walls and flak, and shoots
 * turrets, radar dishes, fighters and fuel tanks. The world is three-dimensional
 * (x sideways, z forward, h altitude). The state is a plain object and `step`
 * returns a new state, so the same code renders the first frame on the server
 * and runs every frame in the browser.
 */

/** How far ahead of the camera the fortress is visible, in world units. */
export const VIEW = 420;
/** The ship flies this far ahead of the camera. */
export const PLAYER_Z = 50;
/** Half the width of the fortress deck; the ship stays inside. */
export const DECK = 70;
export const X_MAX = 58;
export const H_MIN = 4;
export const H_MAX = 70;
/** Walls are this high: fly above them or through their gate. */
export const WALL_HEIGHT = 56;

const SPEED = 70;
const STRAFE = 75;
const CLIMB = 55;
const SHOT_SPEED = 280;
const FLAK_SPEED = 110;
const FIRE_DELAY = 0.18;
const FUEL_BURN = 3.2;
const LIVES = 3;
const SAFE_TIME = 2.5;
export const BLAST_TIME = 0.6;

const POINTS = { turret: 200, fuel: 300, radar: 500, plane: 400 };

/** A tiny seeded random generator; its seed lives in the state, so runs are reproducible. */
function rand(s) {
  let t = (s.seed = (s.seed + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 0 at the start, 1 deep inside the fortress. */
const difficulty = (s) => Math.min(1, s.z / 5000);

/** Adds a box-shaped thing centered at x and z, standing from h0 to h1. */
function add(s, type, x, z, w, d, h0, h1, extra = {}) {
  s.things.push({
    id: ++s.id,
    type,
    x,
    z,
    w,
    d,
    h0,
    h1,
    hp: 1,
    cool: 1 + rand(s),
    fired: -1,
    ...extra,
  });
}

/** A wall across the deck with a gate in it: fly through the gate or above the wall. */
function wall(s, z) {
  const gate = (rand(s) - 0.5) * 2 * (X_MAX - 20);
  const half = 16 + (1 - difficulty(s)) * 6;
  const top = 28 + rand(s) * 10;
  const left = gate - half;
  const right = gate + half;
  add(s, "wall", (-DECK + left) / 2, z, left + DECK, 6, 0, WALL_HEIGHT);
  add(s, "wall", (right + DECK) / 2, z, DECK - right, 6, 0, WALL_HEIGHT);
  add(s, "wall", gate, z, half * 2, 6, top, WALL_HEIGHT);
}

/** Fills the deck ahead of the camera with walls, targets and fighters. */
function populate(s) {
  while (s.next < s.z + VIEW + 60) {
    const z = s.next;
    if (z > 400 && rand(s) < 0.2) {
      wall(s, z);
      s.next += 70;
      continue;
    }
    // Up to three ground targets, each in its own lane.
    const lanes = [-40, -14, 12, 38].sort(() => rand(s) - 0.5);
    const count = 1 + Math.floor(rand(s) * 3);
    for (const lane of lanes.slice(0, count)) {
      const x = lane + (rand(s) - 0.5) * 8;
      const dz = z + (rand(s) - 0.5) * 20;
      const r = rand(s);
      if (r < 0.4) {
        add(s, "turret", x, dz, 12, 12, 0, 9);
      } else if (r < 0.7) {
        add(s, "fuel", x, dz, 13, 13, 0, 16);
      } else {
        add(s, "radar", x, dz, 10, 10, 0, 7);
      }
    }
    if (rand(s) < 0.12 + difficulty(s) * 0.3) {
      const h = 15 + rand(s) * 45;
      add(s, "plane", (rand(s) - 0.5) * 2 * X_MAX, z + 40, 16, 12, h - 3, h + 3);
    }
    s.next += 45 + rand(s) * 35;
  }
}

export function initialState(status = "ready") {
  const state = {
    status,
    clock: 0,
    z: 0,
    x: 0,
    h: 30,
    fuel: 100,
    score: 0,
    lives: LIVES,
    seed: 1983,
    id: 0,
    next: 160,
    cooldown: 0,
    safe: status === "playing" ? SAFE_TIME : 0,
    things: [],
    shots: [],
    flak: [],
    blasts: [],
  };
  populate(state);
  return state;
}

/** Is the point inside the thing's box, grown by a margin? */
const inside = (t, x, z, h, m) =>
  Math.abs(x - t.x) <= t.w / 2 + m &&
  Math.abs(z - t.z) <= t.d / 2 + m &&
  h >= t.h0 - m &&
  h <= t.h1 + m;

function crash(s) {
  s.blasts.push({
    id: ++s.id,
    x: s.x,
    z: s.z + PLAYER_Z,
    h: s.h,
    age: 0,
    big: true,
  });
  s.lives -= 1;
  s.fuel = 100;
  s.safe = SAFE_TIME;
  s.flak = [];
  if (s.lives <= 0) {
    s.status = "over";
  }
}

/** Advances the game by dt seconds with the controls held down. */
export function step(prev, input, dt) {
  if (prev.status !== "playing") {
    return prev;
  }
  const s = structuredClone(prev);
  const level = difficulty(s);
  s.clock += dt;
  s.z += SPEED * (1 + level * 0.5) * dt;
  s.score += dt * 10;

  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const dh = (input.up ? 1 : 0) - (input.down ? 1 : 0);
  s.x = Math.max(-X_MAX, Math.min(X_MAX, s.x + dx * STRAFE * dt));
  s.h = Math.max(H_MIN, Math.min(H_MAX, s.h + dh * CLIMB * dt));
  s.fuel -= FUEL_BURN * (1 + level * 0.3) * dt;

  const pz = s.z + PLAYER_Z;
  s.cooldown -= dt;
  if (input.fire && s.cooldown <= 0) {
    s.shots.push({ x: s.x, z: pz + 10, h: s.h });
    s.cooldown = FIRE_DELAY;
  }

  for (const t of s.things) {
    if (t.type === "plane") {
      // Fighters fly head-on and veer towards the ship.
      t.z -= (45 + level * 30) * dt;
      t.x += Math.sign(s.x - t.x) * Math.min(Math.abs(s.x - t.x), 18 * dt);
    } else if (t.type === "turret") {
      t.cool -= dt;
      const ahead = t.z - pz;
      if (t.cool <= 0 && ahead > 40 && ahead < 320) {
        const [vx, vz, vh] = [s.x - t.x, pz + 20 - t.z, s.h - t.h1];
        const length = Math.hypot(vx, vz, vh);
        const speed = FLAK_SPEED * (1 + level * 0.4);
        s.flak.push({
          x: t.x,
          z: t.z,
          h: t.h1,
          vx: (vx / length) * speed,
          vz: (vz / length) * speed,
          vh: (vh / length) * speed,
          age: 0,
        });
        t.fired = s.clock;
        t.cool = 1.8 - level * 0.7 + rand(s) * 0.6;
      }
    }
  }

  for (const f of s.flak) {
    f.x += f.vx * dt;
    f.z += f.vz * dt;
    f.h += f.vh * dt;
    f.age += dt;
  }
  s.flak = s.flak.filter((f) => f.age < 4 && f.h > 0);

  // Shots fly until they hit something or leave the screen.
  s.shots = s.shots.filter((shot) => {
    shot.z += SHOT_SPEED * dt;
    if (shot.z > s.z + VIEW) {
      return false;
    }
    const hit = s.things.find((t) => inside(t, shot.x, shot.z, shot.h, 2));
    if (!hit) {
      return true;
    }
    if (hit.type !== "wall" && --hit.hp <= 0) {
      hit.dead = true;
      s.score += POINTS[hit.type];
      if (hit.type === "fuel") {
        s.fuel = Math.min(100, s.fuel + 30);
      }
      s.blasts.push({
        id: ++s.id,
        x: hit.x,
        z: hit.z,
        h: (hit.h0 + hit.h1) / 2,
        age: 0,
      });
    }
    return false;
  });
  s.things = s.things.filter((t) => !t.dead && t.z > s.z - 80);

  s.safe -= dt;
  if (s.safe <= 0) {
    if (
      s.fuel <= 0 ||
      s.things.some((t) => inside(t, s.x, pz, s.h, 3)) ||
      s.flak.some((f) => Math.hypot(f.x - s.x, f.z - pz, f.h - s.h) < 6)
    ) {
      crash(s);
    }
  }

  for (const b of s.blasts) {
    b.age += dt;
  }
  s.blasts = s.blasts.filter((b) => b.age < BLAST_TIME);
  populate(s);
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
