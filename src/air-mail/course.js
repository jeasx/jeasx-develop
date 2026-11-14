/**
 * The landscape of the daily course. This module only runs on the server: the
 * browser never sees how the course is made, only the chunks streamed to it.
 *
 * Every chunk has a biome (meadow, forest, mountains, lake, village or
 * airstrip). The ground height is a smooth noise curve whose roughness and
 * flatness blend from one chunk to the next, so chunks join without seams.
 */
import { CHUNK, SAMPLE, STRIP_Y } from "./shared";

/** The seed of today's course, e.g. 20261114, so everyone flies the same course all day. */
export function daySeed(date = new Date()) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

/** Accepts a seed from a request only if it looks like a date. */
export function validSeed(value) {
  const seed = Number(value);
  return Number.isInteger(seed) && seed >= 20000101 && seed <= 29991231 ? seed : daySeed();
}

/** A stable pseudo random number in [0, 1) for a seed and two integers. */
export function hash(seed, a, b = 0) {
  let h =
    Math.imul(seed ^ 0x9e3779b9, 374761393) +
    Math.imul(a + 7, 668265263) +
    Math.imul(b + 3, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/** Smooth value noise in [0, 1). */
function noise(seed, x, layer) {
  const i = Math.floor(x);
  return lerp(hash(seed, i, layer), hash(seed, i + 1, layer), smooth(x - i));
}

/** Hills on three scales, in [0, 1). */
function roughness(seed, x) {
  return (
    0.55 * noise(seed, x / 90, 1) + 0.3 * noise(seed, x / 37, 2) + 0.15 * noise(seed, x / 13, 3)
  );
}

/** How rough, how flat and how high each biome is. */
const BIOMES = {
  meadow: { amp: 22, flat: 0, level: 0 },
  forest: { amp: 30, flat: 0, level: 0 },
  mountains: { amp: 125, flat: 0, level: 0 },
  lake: { amp: 10, flat: 1, level: 170 },
  village: { amp: 14, flat: 1, level: 146 },
  airstrip: { amp: 10, flat: 1, level: STRIP_Y },
};

/** The biome of a chunk: an airstrip at the start and every seventh chunk, otherwise random. */
export function biomeAt(seed, index) {
  if (index % 7 === 0) {
    return "airstrip";
  }
  const r = hash(seed, index, 11);
  return r < 0.25
    ? "village"
    : r < 0.45
      ? "forest"
      : r < 0.65
        ? "mountains"
        : r < 0.85
          ? "meadow"
          : "lake";
}

/**
 * The biome parameters at x. Each chunk keeps its own parameters in its middle
 * half and blends into its neighbors over the quarter on either side.
 */
function paramsAt(seed, x) {
  const f = x / CHUNK;
  const i = Math.floor(f);
  const left = f - i < 0.5 ? i - 1 : i;
  const t = Math.min(1, Math.max(0, (f - (left + 1)) * 2 + 0.5));
  const a = BIOMES[biomeAt(seed, left)];
  const b = BIOMES[biomeAt(seed, left + 1)];
  const s = smooth(t);
  return {
    amp: lerp(a.amp, b.amp, s),
    flat: lerp(a.flat, b.flat, s),
    level: lerp(a.level || 150, b.level || 150, s),
  };
}

/** Height of the ground at x; larger numbers are lower on the screen. */
export function groundAt(seed, x) {
  const p = paramsAt(seed, x);
  const hills = 154 - p.amp * roughness(seed, x);
  return Math.min(174, lerp(hills, p.level, p.flat));
}

/** Lakes fill up to this height. */
export const WATER_Y = 152;

/**
 * The stretches of water in a chunk: wherever the ground dips below the water
 * line, if a lake chunk is this one or a neighbor. Each stretch has the exact
 * shorelines and the lake bed in between, relative to the chunk's left edge.
 */
function waterIn(seed, index) {
  if (![index - 1, index, index + 1].some((i) => biomeAt(seed, i) === "lake")) {
    return [];
  }
  const x0 = index * CHUNK;
  const depth = (x) => groundAt(seed, x0 + x) - WATER_Y;
  const stretches = [];
  let start = depth(0) > 0 ? 0 : null;
  for (let x = 2; x <= CHUNK; x += 2) {
    const before = depth(x - 2);
    const now = depth(x);
    if (before > 0 !== now > 0) {
      // The shoreline lies between the two samples.
      const shore = x - 2 + (2 * before) / (before - now);
      if (now > 0) {
        start = shore;
      } else {
        stretches.push({ x0: start, x1: shore });
        start = null;
      }
    }
  }
  if (start !== null) {
    stretches.push({ x0: start, x1: CHUNK });
  }
  return stretches.map((w, n) => {
    const bed = [];
    for (let x = Math.ceil(w.x0 / 2) * 2; x <= w.x1; x += 2) {
      bed.push([x, groundAt(seed, x0 + x)]);
    }
    // A fish lives in every stretch of water wide enough to leap in.
    const width = w.x1 - w.x0;
    const fish =
      width > 50
        ? {
            x: w.x0 + 20 + hash(seed, index, 500 + n) * (width - 40),
            flip: hash(seed, index, 510 + n) < 0.5,
            delay: Math.round(hash(seed, index, 520 + n) * 70) / 10,
          }
        : null;
    return { ...w, bed, fish };
  });
}

/**
 * Everything in one chunk: the ground outline, trees, houses, sheep, villagers, the drop
 * zone of a village, the airstrip, and the outline the plane can crash into.
 * Coordinates are relative to the chunk's left edge.
 */
export function buildChunk(seed, index) {
  const biome = biomeAt(seed, index);
  const x0 = index * CHUNK;
  const rand = (n) => hash(seed, index, 100 + n);
  const ground = [];
  for (let x = 0; x <= CHUNK; x += SAMPLE / 2) {
    ground.push(groundAt(seed, x0 + x));
  }
  const at = (x) => groundAt(seed, x0 + x);

  const trees = [];
  const houses = [];
  const sheep = [];
  const people = [];
  const rocks = [];
  let drop = null;
  let strip = null;
  const snow = [];

  if (biome === "forest") {
    for (let x = 6; x < CHUNK; x += 9 + rand(x) * 9) {
      trees.push({ x, kind: rand(x + 1) < 0.75 ? "pine" : "oak", h: 14 + rand(x + 2) * 12 });
    }
  } else if (biome === "meadow") {
    for (let n = 0; n < 4; n++) {
      trees.push({ x: 20 + n * 80 + rand(n) * 40, kind: "oak", h: 12 + rand(n + 5) * 8 });
    }
    for (let n = 0; n < 4; n++) {
      sheep.push({
        x: 40 + rand(n + 10) * 240,
        flip: rand(n + 20) < 0.5,
        // Every sheep is at its own point of its grazing and walking cycle.
        delay: Math.round(rand(n + 60) * 90) / 10,
      });
    }
  } else if (biome === "mountains") {
    // Snowflakes fall over the mountains, each down to the slope below it.
    for (let n = 0; n < 36; n++) {
      const x = rand(n + 200) * CHUNK;
      snow.push({
        x,
        fall: at(x) + 4,
        r: 0.5 + rand(n + 240) * 0.7,
        drift: (rand(n + 280) - 0.5) * 16,
        duration: 5 + rand(n + 320) * 4,
        delay: rand(n + 360) * 9,
      });
    }
    for (let x = 10; x < CHUNK; x += 14 + rand(x) * 16) {
      if (at(x) > 115) {
        trees.push({ x, kind: "pine", h: 10 + rand(x + 3) * 8 });
      } else if (rand(x + 4) < 0.4 && Math.abs(at(x + 4) - at(x - 4)) < 6) {
        // Boulders only rest where the slope is gentle enough.
        rocks.push({ x, r: 3 + rand(x + 5) * 3 });
      }
    }
  } else if (biome === "village") {
    drop = { x0: 142, x1: 178 };
    const spots = [92, 112, 202, 224, 246];
    for (const [n, x] of spots.entries()) {
      if (rand(n + 30) < 0.8) {
        houses.push({
          x,
          kind: n === 3 && rand(40) < 0.5 ? "church" : "house",
          color: Math.floor(rand(n + 50) * 4),
        });
      }
    }
    trees.push({ x: 40, kind: "oak", h: 14 }, { x: 290, kind: "pine", h: 18 });
    // Villagers stand in the gaps between the houses and beside the drop zone.
    for (const [n, x] of [74, 102, 133, 187, 262].entries()) {
      if (rand(n + 70) < 0.8) {
        people.push({
          x: x + (rand(n + 75) - 0.5) * 3,
          child: rand(n + 80) < 0.3,
          shirt: Math.floor(rand(n + 85) * 5),
          hair: Math.floor(rand(n + 90) * 4),
          delay: Math.round(rand(n + 95) * 50) / 10,
        });
      }
    }
  } else if (biome === "airstrip") {
    strip = { x0: 86, x1: 250 };
  } else if (biome === "lake") {
    trees.push({ x: 12, kind: "oak", h: 12 }, { x: 308, kind: "oak", h: 14 });
  }

  // Water fills the hollow of a lake, which reaches into the chunks next to it.
  const water = waterIn(seed, index);
  const wet = (x) => water.some((w) => x >= w.x0 - 2 && x <= w.x1 + 2);
  for (let n = trees.length - 1; n >= 0; n--) {
    if (wet(trees[n].x)) {
      trees.splice(n, 1);
    }
  }
  for (const tree of trees) {
    tree.y = at(tree.x);
  }
  for (const person of people) {
    person.y = at(person.x);
  }
  for (const house of houses) {
    house.y = at(house.x);
    house.h = house.kind === "church" ? 26 : 13;
  }

  // The outline the plane crashes into: ground, water, treetops and roofs.
  const solid = [];
  for (let x = 0; x <= CHUNK; x += SAMPLE) {
    let y = at(x);
    if (water.some((w) => x >= w.x0 && x <= w.x1)) {
      y = Math.min(y, WATER_Y);
    }
    for (const tree of trees) {
      if (Math.abs(x - tree.x) < 5) {
        y = Math.min(y, tree.y - tree.h);
      }
    }
    for (const house of houses) {
      if (Math.abs(x - house.x) < 9) {
        y = Math.min(y, house.y - house.h);
      }
    }
    solid.push(Math.round(y * 10) / 10);
  }

  return {
    index,
    biome,
    ground,
    trees,
    houses,
    sheep,
    people,
    rocks,
    drop,
    strip,
    water,
    snow,
    solid,
  };
}
