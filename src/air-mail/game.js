/**
 * Flight rules for the mail plane. The state is a plain object and `step`
 * returns a new state, so the server renders the first frame with the same code
 * that runs every frame in the browser. The landscape comes in as `world`,
 * built from the chunks the server streamed: where the plane would crash,
 * where the villages want their mail and where it can land.
 */
import { CHUNK, STRIP_Y } from "./shared";

export const PARCELS = 5;
export const LIVES = 3;
/** The wheels are this far below the plane's center. */
export const WHEELS = 6;
export const CRASH_TIME = 2.2;

const SPEED_MIN = 45;
const SPEED_MAX = 110;
const TAKEOFF_SPEED = 50;
const CEILING = 14;
/** Touching down faster than this, even on a runway, is a crash. */
const LANDING_SINK = 62;
const FUEL_BURN = 2.2;
const POPUP_TIME = 1.4;

/**
 * @typedef {{ x0: number, x1: number, id: number }} Zone
 * @typedef {{
 *   solidAt: (x: number) => number | null,
 *   dropAt: (x: number) => Zone | null,
 *   stripAt: (x: number) => Zone | null,
 * }} World
 */

export function initialState(status = "ready") {
  return {
    status,
    clock: 0,
    x: 110,
    y: STRIP_Y - WHEELS,
    vy: 0,
    speed: 0,
    fuel: 100,
    parcels: PARCELS,
    score: 0,
    lives: LIVES,
    landed: true,
    crash: 0,
    crashX: 0,
    crashY: 0,
    safe: 0,
    dropWas: false,
    trailClock: 0,
    trail: [],
    drops: [],
    popups: [],
    delivered: [],
    strips: [0],
  };
}

/** Distance flown, in kilometers, shown on the instruments. */
export const kilometers = (state) => Math.max(0, (state.x - 110) / 400);

/** The plane's nose points where it flies. */
export const pitch = (state) =>
  state.landed ? 0 : (Math.atan2(state.vy, state.speed) * 180) / Math.PI;

function popup(s, x, y, text, kind) {
  s.popups.push({ x, y, text, kind, t: 0 });
}

function crash(s) {
  Object.assign(s, { crash: CRASH_TIME, crashX: s.x, crashY: s.y, landed: false, speed: 0, vy: 0 });
  s.lives -= 1;
}

/** After a crash, a new plane comes in high above the place of the crash. */
function respawn(s) {
  if (s.lives <= 0) {
    s.status = "over";
    return;
  }
  Object.assign(s, { y: 36, vy: 0, speed: 70, fuel: Math.max(s.fuel, 60), safe: 1.5, trail: [] });
}

/** Lets the parcels fall: first freely, then slowly under their parachutes. */
function updateDrops(s, world, dt) {
  s.drops = s.drops.filter((d) => {
    d.t += dt;
    if (d.t > 0.45) {
      d.vx += (10 - d.vx) * Math.min(1, 2 * dt);
      d.vy += (24 - d.vy) * Math.min(1, 3 * dt);
    } else {
      d.vy += 150 * dt;
    }
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    const ground = world.solidAt(d.x);
    if (ground === null || d.y + 3 < ground) {
      return d.y < 400;
    }
    const zone = world.dropAt(d.x);
    if (zone && !s.delivered.includes(zone.id)) {
      const half = (zone.x1 - zone.x0) / 2;
      const points = 100 + Math.round(200 * (1 - Math.abs(d.x - (zone.x0 + half)) / half));
      s.score += points;
      s.delivered = [...s.delivered, zone.id];
      popup(s, d.x, ground - 8, `+${points}`, "good");
    } else {
      popup(s, d.x, ground - 8, zone ? "Already served" : "Missed", "bad");
    }
    return false;
  });
  s.popups = s.popups.filter((p) => (p.t += dt) < POPUP_TIME);
}

/**
 * Advances the flight by dt seconds with the controls held down.
 * @param {ReturnType<typeof initialState>} prev
 * @param {{ up: boolean, down: boolean, left: boolean, right: boolean, drop: boolean }} input
 * @param {number} dt
 * @param {World} world
 */
export function step(prev, input, dt, world) {
  if (prev.status !== "playing") {
    return prev;
  }
  const s = {
    ...prev,
    drops: prev.drops.map((d) => ({ ...d })),
    popups: prev.popups.map((p) => ({ ...p })),
  };
  s.clock += dt;
  const pressed = input.drop && !prev.dropWas;
  s.dropWas = input.drop;
  updateDrops(s, world, dt);

  if (s.crash > 0) {
    s.crash -= dt;
    if (s.crash <= 0) {
      respawn(s);
    }
    return s;
  }
  s.safe -= dt;
  const engine = s.fuel > 0;

  if (s.landed) {
    // On the runway: open the throttle to roll, otherwise brake to a stop and refuel.
    const strip = world.stripAt(s.x);
    if ((input.up || input.right) && engine) {
      s.speed = Math.min(80, s.speed + 40 * dt);
    } else {
      s.speed = Math.max(0, s.speed - 45 * dt);
    }
    s.x += s.speed * dt;
    if (s.speed === 0) {
      s.fuel = Math.min(100, s.fuel + 45 * dt);
      if (s.parcels < PARCELS) {
        s.parcels = PARCELS;
        popup(s, s.x, s.y - 14, "Mail loaded", "good");
      }
    }
    if (input.up && s.speed >= TAKEOFF_SPEED) {
      s.landed = false;
      s.vy = -30;
    } else if (!strip || s.x > strip.x1 - 4) {
      crash(s);
      return s;
    }
  } else {
    if (engine) {
      const throttle = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      s.speed = Math.max(SPEED_MIN, Math.min(SPEED_MAX, s.speed + throttle * 30 * dt));
      s.fuel = Math.max(0, s.fuel - FUEL_BURN * (s.speed / 75) * dt);
    } else {
      // Out of fuel: the propeller stops and the plane glides down.
      s.speed += (40 - s.speed) * Math.min(1, dt);
    }
    const target = !engine ? 32 : input.up ? -48 : input.down ? 60 : 8;
    s.vy += Math.max(-140 * dt, Math.min(140 * dt, target - s.vy));
    s.x += s.speed * dt;
    s.y += s.vy * dt;
    if (s.y < CEILING) {
      s.y = CEILING;
      s.vy = Math.max(0, s.vy);
    }
    if (pressed && s.parcels > 0) {
      s.parcels -= 1;
      s.drops.push({ x: s.x - 2, y: s.y + 4, vx: s.speed * 0.9, vy: s.vy, t: 0 });
    }

    const below = Math.min(world.solidAt(s.x - 6) ?? 999, world.solidAt(s.x + 6) ?? 999);
    const nose = world.solidAt(s.x + 12) ?? 999;
    if (s.safe <= 0 && s.y - 1 >= nose) {
      crash(s);
      return s;
    }
    if (s.y + WHEELS >= below) {
      const strip = world.stripAt(s.x);
      if (strip && s.x > strip.x0 + 4 && s.x < strip.x1 - 20 && s.vy <= LANDING_SINK) {
        Object.assign(s, { landed: true, y: STRIP_Y - WHEELS, vy: 0 });
        if (!s.strips.includes(strip.id)) {
          s.strips = [...s.strips, strip.id];
          s.score += 50;
          popup(s, s.x, s.y - 14, "Landed +50", "good");
        }
      } else if (s.safe <= 0) {
        crash(s);
        return s;
      } else {
        s.y = below - WHEELS;
        s.vy = Math.min(0, s.vy);
      }
    }
  }

  // Puffs of exhaust trail behind the engine.
  s.trailClock += dt;
  if (s.trailClock > 0.06 && engine && s.speed > 0) {
    s.trailClock = 0;
    s.trail = [{ x: s.x - 13, y: s.y + 1, t: s.clock }, ...s.trail.slice(0, 7)];
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

/** The chunk a world position lies in. */
export const chunkOf = (x) => Math.floor(x / CHUNK);
