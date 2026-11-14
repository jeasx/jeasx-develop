/**
 * Game rules for a pseudo-3D racer: the track is a loop of short road
 * segments, each with a curve and a height. The state is a plain object and
 * `step` returns a new state, so the same code renders the first frame on the
 * server and runs every frame in the browser.
 */

/** Length of a segment in world units. */
export const SEGMENT = 200;
/** Half the width of the road in world units; sprite offsets count in these. */
export const ROAD = 2000;
export const LANES = 3;
export const CAMERA_HEIGHT = 1000;
/** Distance from the camera to the screen for a field of view of 100°. */
export const DEPTH = 1 / Math.tan((50 * Math.PI) / 180);
/** The player's car sits right on the projection plane. */
export const PLAYER_Z = CAMERA_HEIGHT * DEPTH;
/** Segments drawn ahead of the camera. */
export const DRAW_DISTANCE = 110;
export const MAX_SPEED = SEGMENT * 45;
/** Width of a car, in half road widths. */
export const CAR_WIDTH = 0.25;
/** World size of a cow, and how fast it crosses, in half road widths per second. */
export const COW = { width: 900, height: 650 };
const COW_WIDTH = COW.width / ROAD;
const COW_SPEED = 0.45;

const ACCELERATION = MAX_SPEED / 5;
const BRAKING = -MAX_SPEED;
const DECELERATION = -MAX_SPEED / 5;
const OFFROAD_DECELERATION = -MAX_SPEED / 2;
const OFFROAD_LIMIT = MAX_SPEED / 4;
const CENTRIFUGAL = 0.3;
const START_TIME = 50;
const LAP_BONUS = 40;
const COUNTDOWN = 3;

/** A tiny seeded random generator, so server and browser build the same track. */
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeIn = (a, b, p) => a + (b - a) * p * p;
const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
export const lerp = (a, b, p) => a + (b - a) * p;

function buildTrack() {
  const segments = [];
  const height = () => (segments.length ? segments[segments.length - 1].y2 : 0);
  const add = (curve, y2) =>
    segments.push({
      index: segments.length,
      curve,
      y1: height(),
      y2,
      sprites: [],
    });

  /** A stretch of road that eases into a curve and hill, holds and eases out. */
  function road(enter, hold, leave, curve = 0, hill = 0) {
    const start = height();
    const end = start + hill * SEGMENT;
    const total = enter + hold + leave;
    for (let n = 0; n < enter; n++)
      add(easeIn(0, curve, n / enter), easeInOut(start, end, n / total));
    for (let n = 0; n < hold; n++) add(curve, easeInOut(start, end, (enter + n) / total));
    for (let n = 0; n < leave; n++)
      add(easeInOut(curve, 0, n / leave), easeInOut(start, end, (enter + hold + n) / total));
  }

  road(40, 40, 40);
  road(30, 60, 30, 2, 20);
  road(25, 25, 25, 0, -20);
  road(40, 50, 40, -4);
  road(30, 30, 30, 0, 40);
  road(25, 25, 25, 3, -20);
  road(25, 25, 25, -3, -20);
  road(25, 25, 25, 3);
  road(50, 50, 50);
  road(40, 80, 40, 5, 30);
  road(30, 30, 30, 0, -40);
  road(30, 40, 30, -2, 20);
  road(25, 25, 25, 0, 25);
  road(25, 25, 25, 0, -25);
  road(40, 60, 40, -5);
  road(30, 30, 30, 2, 10);
  road(60, 60, 60, 0, -height() / SEGMENT);

  const rnd = random(7);
  const place = (index, type, offset) =>
    segments[index]?.sprites.push({ type, offset, ...SPRITES[type] });
  place(4, "gantry", 0);
  // Spectators line both sides of the start straight and the outside of the hardest curves.
  for (let i = 8; i < 40; i += 4) {
    place(i, "crowd", -1.7);
    place(i, "crowd", 1.7);
  }
  segments.forEach((segment, i) => {
    if (Math.abs(segment.curve) >= 4 && i % 6 === 0)
      place(i, "crowd", Math.sign(segment.curve) * 1.7);
  });
  for (let i = 20; i < segments.length - 10; i += 3 + Math.floor(rnd() * 4)) {
    if (segments[i].sprites.length) continue;
    const side = rnd() < 0.5 ? -1 : 1;
    const kind = rnd();
    place(i, kind < 0.55 ? "tree" : kind < 0.8 ? "pine" : "bush", side * (1.4 + rnd() * 2.5));
    if (rnd() < 0.4) place(i, rnd() < 0.5 ? "tree" : "pine", -side * (1.5 + rnd() * 3));
  }
  for (let i = 60; i < segments.length; i += 120) {
    place(i, "billboard", (i / 120) % 2 ? 1.6 : -1.6);
  }
  return segments;
}

/** World size of sprites; `collides` marks the ones that stop a car. */
const SPRITES = {
  tree: { width: 900, height: 1200, collides: true },
  pine: { width: 700, height: 1500, collides: true },
  bush: { width: 600, height: 380, collides: false },
  billboard: { width: 1500, height: 1100, collides: true },
  crowd: { width: 1800, height: 900, collides: true },
  gantry: { width: 5200, height: 1700, collides: false },
};

export const TRACK = buildTrack();
export const TRACK_LENGTH = TRACK.length * SEGMENT;

/** @param {number} z */
export const segmentAt = (z) => TRACK[Math.floor(z / SEGMENT) % TRACK.length];

const wrap = (z) => ((z % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;

const COLORS = ["blue", "yellow", "green", "purple", "orange", "white"];

function traffic() {
  const rnd = random(42);
  return Array.from({ length: 22 }, (_, id) => ({
    id,
    z: wrap(SEGMENT * 40 + rnd() * (TRACK_LENGTH - SEGMENT * 60)),
    offset: (Math.floor(rnd() * LANES) - 1) * 0.6,
    speed: MAX_SPEED * (0.3 + rnd() * 0.35),
    color: COLORS[id % COLORS.length],
  }));
}

export function initialState() {
  return {
    status: "ready",
    position: 0,
    speed: 0,
    x: 0,
    steer: 0,
    time: START_TIME,
    countdown: COUNTDOWN,
    clock: 0,
    lap: 1,
    lapTime: 0,
    lastLap: 0,
    bestLap: 0,
    score: 0,
    crash: 0,
    drift: 0,
    driftSide: 0,
    // A cow crossing the road ahead, and when the next one shows up.
    cow: null,
    nextCow: 12,
    sky: 0,
    cars: traffic(),
  };
}

/** Starts a new race, or continues a paused one. */
export function start(state) {
  if (state.status === "paused") return { ...state, status: state.clock ? "playing" : "countdown" };
  if (state.status === "ready" || state.status === "over")
    return { ...initialState(), status: "countdown" };
  return state;
}

export const pause = (state) =>
  state.status === "playing" || state.status === "countdown"
    ? { ...state, status: "paused" }
    : state;

/** Whether two things side by side overlap; positions and widths in half road widths. */
const overlap = (x1, w1, x2, w2) => Math.abs(x1 - x2) < (w1 + w2) / 2;

/**
 * Advances the race by `dt` seconds.
 * @param {{ up?: boolean, down?: boolean, left?: boolean, right?: boolean }} input
 */
export function step(state, input, dt) {
  if (state.status === "countdown") {
    const countdown = state.countdown - dt;
    return countdown > 0 ? { ...state, countdown } : { ...state, countdown: 0, status: "playing" };
  }
  if (state.status !== "playing") return state;

  let { speed, x, lap, lapTime, lastLap, bestLap, time, crash } = state;
  const segment = segmentAt(state.position + PLAYER_Z);
  const percent = speed / MAX_SPEED;
  const dx = dt * 2 * percent;

  let position = state.position + dt * speed;
  lapTime += dt;
  if (position >= TRACK_LENGTH) {
    position -= TRACK_LENGTH;
    lap += 1;
    lastLap = lapTime;
    bestLap = bestLap ? Math.min(bestLap, lapTime) : lapTime;
    lapTime = 0;
    time += LAP_BONUS;
  }

  const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  x += steer * dx - dx * percent * segment.curve * CENTRIFUGAL;

  if (input.up) speed += ACCELERATION * dt;
  else if (input.down) speed += BRAKING * dt;
  else speed += DECELERATION * dt;
  if (Math.abs(x) > 1 && speed > OFFROAD_LIMIT) speed += OFFROAD_DECELERATION * dt;

  crash = Math.max(0, crash - dt);
  // The tires slide when a curve pulls hard at speed, and more so when the
  // player steers into it. Smoothed, so the smoke fades in and out.
  const pull = Math.abs(segment.curve) * percent * (steer * segment.curve > 0 ? 1.3 : 1);
  const slide = Math.abs(x) > 1 ? 0 : Math.max(0, Math.min(1, (pull - 1.6) / 2.4));
  const drift = state.drift + (slide - state.drift) * Math.min(1, dt * 6);
  // Roadside objects stop the car dead.
  if (Math.abs(x) > 1) {
    for (const sprite of segment.sprites) {
      if (sprite.collides && overlap(x, CAR_WIDTH, sprite.offset, (sprite.width / ROAD) * 0.6)) {
        // Bounce back towards the road.
        speed = MAX_SPEED / 10;
        x -= Math.sign(x) * 0.3;
        crash = 0.6;
        break;
      }
    }
  }

  const playerZ = position + PLAYER_Z;
  const cars = state.cars.map((car) => {
    let { z, offset } = car;
    // How far the car is ahead of the player, around the loop.
    const ahead = wrap(z - playerZ);
    // Cars make room for a faster player coming up behind them.
    if (
      ahead < SEGMENT * 20 &&
      speed > car.speed &&
      overlap(x, CAR_WIDTH * 1.5, offset, CAR_WIDTH)
    ) {
      const away = offset > x || (offset === x && offset < 0) ? 1 : -1;
      offset = Math.max(-0.8, Math.min(0.8, offset + away * dt * 0.6));
    }
    return { ...car, offset, z: wrap(z + dt * car.speed) };
  });

  for (const car of cars) {
    const ahead = wrap(car.z - playerZ);
    if (
      ahead < SEGMENT * 0.6 &&
      speed > car.speed &&
      overlap(x, CAR_WIDTH, car.offset, CAR_WIDTH)
    ) {
      speed = car.speed * (car.speed / speed);
      position = wrap(car.z - PLAYER_Z - SEGMENT * 0.6);
      crash = 0.4;
      break;
    }
  }

  // Now and then a cow wanders across the road ahead. It ambles from one side
  // to the other and leaves once it's across or behind the player.
  let { cow, nextCow } = state;
  const clock = state.clock + dt;
  if (!cow && clock >= nextCow) {
    const dir = Math.floor(clock) % 2 ? 1 : -1;
    cow = {
      z: wrap(playerZ + SEGMENT * 100),
      offset: -dir * (1.3 + (clock % 1) * 0.6),
      dir,
      hit: false,
    };
  }
  if (cow) {
    cow = { ...cow, offset: cow.offset + cow.dir * COW_SPEED * dt };
    const ahead = wrap(cow.z - playerZ);
    if (!cow.hit && ahead < SEGMENT * 0.6 && overlap(x, CAR_WIDTH, cow.offset, COW_WIDTH)) {
      // Moo! The cow survives, but the car comes to a sudden halt.
      speed = Math.min(speed, MAX_SPEED / 10);
      crash = 0.6;
      cow = { ...cow, hit: true };
    }
    if (Math.abs(cow.offset) > 2.5 || ahead > TRACK_LENGTH / 2) {
      cow = null;
      nextCow = clock + 15 + ((clock * 7.3) % 10);
    }
  }

  speed = Math.max(0, Math.min(MAX_SPEED, speed));
  x = Math.max(-3, Math.min(3, x));
  time = Math.max(0, time - dt);

  return {
    ...state,
    status: time > 0 ? "playing" : "over",
    position,
    speed,
    x,
    steer,
    time,
    clock: state.clock + dt,
    lap,
    lapTime,
    lastLap,
    bestLap,
    crash,
    drift,
    // Which way the curve bends, so the smoke trails to its inside.
    driftSide: slide > 0 ? Math.sign(segment.curve) : state.driftSide,
    score: state.score + (dt * speed) / 20,
    sky: state.sky + dt * percent * segment.curve * 0.02,
    cars,
    cow,
    nextCow,
  };
}

/** Speed for the speedometer. */
export const kmh = (state) => Math.round((state.speed / MAX_SPEED) * 290);
