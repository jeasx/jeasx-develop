/**
 * A tiny Whitted-style ray tracer: spheres on a checkered floor, one light,
 * hard shadows, mirror reflections and a sky gradient. Plain math, no dependencies.
 */

export const WIDTH = 960;
export const HEIGHT = 540;
export const TILE = 60;

const MAX_DEPTH = 4;
const EPSILON = 1e-4;

// Small vector helpers on [x, y, z] arrays.
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mix = (a, b, t) => add(mul(a, 1 - t), mul(b, t));

// The floor is a soft rubber sheet: every sphere presses a dent into it, deeper and wider
// the heavier it is. Each dent is a Gaussian bell, so the sheet stays smooth everywhere.
const SPHERES = [
  { x: 0, z: 0, radius: 1, color: [0.93, 0.16, 0.67], mirror: 0.25 },
  { x: -3.3, z: 1.1, radius: 0.7, color: [0.13, 0.83, 0.77], mirror: 0.1 },
  { x: 3.2, z: 0.4, radius: 0.8, color: [0.9, 0.9, 0.95], mirror: 0.85 },
  { x: 1.5, z: 3, radius: 0.35, color: [0.43, 0.36, 0.99], mirror: 0.2 },
  { x: -1.5, z: 3.3, radius: 0.3, color: [0.98, 0.75, 0.15], mirror: 0.2 },
].map((sphere) => {
  const depth = 0.5 * sphere.radius ** 1.5;
  return {
    ...sphere,
    depth,
    width: 1.8 * sphere.radius,
    // The sphere rests at the bottom of its dent.
    center: [sphere.x, sphere.radius - depth, sphere.z],
  };
});
const DEEPEST = Math.max(...SPHERES.map((sphere) => sphere.depth));

/** Height of the sheet at x, z (0 far away from the spheres, negative in the dents). */
function sheet(x, z, dents = SPHERES) {
  let h = 0;
  for (const { x: sx, z: sz, depth, width } of dents) {
    h -= depth * Math.exp(-((x - sx) ** 2 + (z - sz) ** 2) / (width * width));
  }
  return h;
}

/** Normal of the sheet, from the slopes of all dents. */
function sheetNormal(x, z) {
  let dx = 0;
  let dz = 0;
  for (const { x: sx, z: sz, depth, width } of SPHERES) {
    const w2 = width * width;
    const g = (2 * depth * Math.exp(-((x - sx) ** 2 + (z - sz) ** 2) / w2)) / w2;
    dx += g * (x - sx);
    dz += g * (z - sz);
  }
  return norm([-dx, 1, -dz]);
}

/** Whether a ray, seen from above between t0 and t1, passes within reach of a dent. */
function nearSegment({ x, z, width }, origin, dir, t0, t1) {
  const ax = origin[0] + dir[0] * t0 - x;
  const az = origin[2] + dir[2] * t0 - z;
  const dx = dir[0] * (t1 - t0);
  const dz = dir[2] * (t1 - t0);
  const k = Math.max(0, Math.min(1, -(ax * dx + az * dz) / (dx * dx + dz * dz || 1)));
  // Beyond 3 widths a dent is less than 0.02 % of its depth.
  return Math.hypot(ax + dx * k, az + dz * k) < 3 * width;
}

/**
 * Where a ray hits the sheet. It lies between y = -DEEPEST and y = 0, so the ray is stepped
 * through that slab only.
 */
function hitSheet(origin, dir) {
  // Rays starting inside a dent (reflections, shadows) leave it upwards: ignore the sheet.
  if (dir[1] >= 0 || origin[1] < -EPSILON) return -1;
  const t0 = -origin[1] / dir[1];
  const t1 = (-DEEPEST - origin[1]) / dir[1];
  const end = Math.min(t1, t0 + 12);
  // Only dents near the ray matter; rays passing far away from all of them hit the flat part.
  const dents = SPHERES.filter((sphere) => nearSegment(sphere, origin, dir, t0, end));
  if (dents.length === 0) return t0;
  // Upper bound of the slope: the dents add up, each at most depth / width * 0.86.
  const steepest = dents.reduce((sum, { depth, width }) => sum + (depth / width) * 0.86, 0);
  // Step as far as the sheet's steepest slope allows: never past the surface, few steps.
  const climb = -dir[1] + steepest * Math.hypot(dir[0], dir[2]);
  let t = t0;
  for (let i = 0; i < 40 && t < end; i++) {
    const gap = origin[1] + dir[1] * t - sheet(origin[0] + dir[0] * t, origin[2] + dir[2] * t, dents);
    if (gap < 1e-3) return t;
    t += gap / climb;
  }
  return Math.min(t, end);
}

// The sun stands low above the horizon, in view of the default camera, and lights the scene.
const LIGHT = norm([-0.25, 0.09, -1]);

/** Parses the view from the query string, with sane bounds. */
export function parseView(query) {
  const angle = Number(query.angle);
  const samples = Number(query.samples);
  return {
    angle: Number.isFinite(angle) ? ((Math.round(angle) % 360) + 360) % 360 : 30,
    samples: [1, 2, 4, 6].includes(samples) ? samples : 1,
  };
}

/** Camera orbiting the scene at the given angle in degrees. */
function camera(angle) {
  const rad = (angle * Math.PI) / 180;
  const eye = [Math.sin(rad) * 9, 3, Math.cos(rad) * 9];
  const forward = norm(sub([0, 0.7, 0], eye));
  const right = norm(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  return { eye, forward, right, up, scale: Math.tan((50 * Math.PI) / 360) };
}

/** Nearest hit of a ray, or null. */
function intersect(origin, dir) {
  let best = null;
  for (const sphere of SPHERES) {
    const oc = sub(origin, sphere.center);
    const b = dot(oc, dir);
    const disc = b * b - dot(oc, oc) + sphere.radius * sphere.radius;
    if (disc < 0) continue;
    const t = -b - Math.sqrt(disc);
    if (t > EPSILON && (!best || t < best.t)) {
      best = { t, sphere };
    }
  }
  const t = hitSheet(origin, dir);
  if (t > EPSILON && (!best || t < best.t)) {
    best = { t, sphere: null };
  }
  return best;
}

function sky(dir) {
  const t = Math.max(0, dir[1]);
  const color = mix([0.35, 0.25, 0.45], [0.04, 0.06, 0.16], Math.sqrt(t));
  // The sun: a bright disc with a warm glow around it.
  const s = Math.max(0, dot(dir, LIGHT));
  if (s > 0.9993) return [1, 0.95, 0.85];
  const glow = s ** 12 * 0.35 + s ** 200 * 0.6;
  return add(color, mul([1, 0.65, 0.35], glow));
}

/** Color seen along a ray. */
function trace(origin, dir, depth) {
  const hit = intersect(origin, dir);
  if (!hit) return sky(dir);

  const point = add(origin, mul(dir, hit.t));
  let normal, color, mirror;
  if (hit.sphere) {
    normal = norm(sub(point, hit.sphere.center));
    color = hit.sphere.color;
    mirror = hit.sphere.mirror;
  } else {
    normal = sheetNormal(point[0], point[2]);
    const checker = (Math.floor(point[0]) + Math.floor(point[2])) & 1;
    color = checker ? [0.85, 0.85, 0.88] : [0.12, 0.12, 0.16];
    mirror = 0.3;
    // Fade the floor into the sky towards the horizon.
    const fog = Math.min(1, hit.t / 40);
    color = mix(color, sky([0, 0, 0]), fog);
  }

  const shadowed = intersect(add(point, mul(normal, EPSILON)), LIGHT) !== null;
  const diffuse = shadowed ? 0 : Math.max(0, dot(normal, LIGHT));
  const reflected = sub(dir, mul(normal, 2 * dot(dir, normal)));
  const specular = shadowed ? 0 : Math.max(0, dot(reflected, LIGHT)) ** 60;

  let result = add(mul(color, 0.12 + 0.88 * diffuse), [specular, specular, specular]);
  if (mirror > 0 && depth < MAX_DEPTH) {
    const bounce = trace(add(point, mul(normal, EPSILON)), reflected, depth + 1);
    result = mix(result, bounce, mirror);
  }
  return result;
}

// Lens ghosts: position along the line from the sun through the center (1 = sun,
// negative = mirrored to the other side), radius and tint.
const GHOSTS = [
  { at: 0.55, radius: 0.05, tint: [0.5, 0.35, 0.15] },
  { at: 0.2, radius: 0.025, tint: [0.3, 0.4, 0.2] },
  { at: -0.25, radius: 0.08, tint: [0.15, 0.3, 0.4] },
  { at: -0.55, radius: 0.04, tint: [0.4, 0.2, 0.45] },
  { at: -0.9, radius: 0.14, tint: [0.12, 0.2, 0.3] },
];

// Streaks of the starburst: how many around the circle, rotation and brightness.
const STREAKS = [
  [7, 0.4, 1],
  [11, 2.1, 0.6],
  [13, 4.7, 0.45],
  [17, 1.3, 0.35],
  [23, 5.9, 0.3],
  [29, 3.2, 0.25],
];

/**
 * Starburst: many thin streaks at irregular angles, each with its own brightness and length.
 * Mixing waves with unrelated frequencies keeps any regular pattern from showing. It only
 * depends on the angle around the sun, so it is computed once into a table.
 */
const BURST_SLOTS = 4096;
const BURST = new Float32Array(BURST_SLOTS * 2);
for (let slot = 0; slot < BURST_SLOTS; slot++) {
  const angle = (slot / BURST_SLOTS) * 2 * Math.PI - Math.PI;
  let streaks = 0;
  for (const [k, phase, weight] of STREAKS) {
    streaks += Math.max(0, Math.cos(angle * k + phase)) ** 30 * weight;
  }
  BURST[slot * 2] = streaks;
  BURST[slot * 2 + 1] = 0.6 + 0.4 * Math.cos(angle * 5 + 1.3) * Math.cos(angle * 3 + 0.4);
}

/**
 * Where the sun appears on screen (-1..1, y up), or null if it is behind the camera or
 * hidden by a sphere. Then the camera sees no flare.
 */
function sunOnScreen(cam) {
  const ahead = dot(LIGHT, cam.forward);
  if (ahead <= 0 || intersect(cam.eye, LIGHT)) return null;
  const aspect = WIDTH / HEIGHT;
  return [
    dot(LIGHT, cam.right) / ahead / (aspect * cam.scale),
    dot(LIGHT, cam.up) / ahead / cam.scale,
  ];
}

/**
 * Lens flare at a point on screen: a starburst and halo around the sun, and soft colored
 * ghosts, reflections inside the lens, along the line through the center of the image.
 */
function flare(sun, px, py) {
  const aspect = WIDTH / HEIGHT;
  const dx = (px - sun[0]) * aspect;
  const dy = py - sun[1];
  const r = Math.hypot(dx, dy);
  const slot = Math.round(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * BURST_SLOTS);
  const index = (slot % BURST_SLOTS) * 2;
  const rays = (BURST[index] * 0.45) / (1 + (r * 9) / BURST[index + 1]) + 0.05 / (1 + r * 40);
  // A faint ring around the sun.
  const halo = Math.exp(-(((r - 0.32) / 0.02) ** 2)) * 0.04;
  let red = rays + halo * 1.2;
  let green = rays * 0.9 + halo;
  let blue = rays * 0.75 + halo * 0.7;
  for (const { at, radius, tint } of GHOSTS) {
    const gx = (px - sun[0] * at) * aspect;
    const gy = py - sun[1] * at;
    const d = Math.hypot(gx, gy) / radius;
    // Beyond 1.6 radii the soft edge has faded out.
    if (d > 1.6) continue;
    // A disc with a slightly brighter rim and a soft edge.
    const disc = (d < 1 ? 0.35 + 0.65 * d ** 4 : Math.exp(-((d - 1) * 12))) * 0.35;
    red += tint[0] * disc;
    green += tint[1] * disc;
    blue += tint[2] * disc;
  }
  return [red, green, blue];
}

/**
 * Renders one tile to RGB bytes. Each pixel averages samples × samples rays (anti-aliasing).
 * Draft quality (one sample) traces a single ray for every 2 × 2 pixels, four times faster.
 */
export function renderTile(view, left, top) {
  const cam = camera(view.angle);
  const { samples } = view;
  const block = samples === 1 ? 2 : 1;
  const aspect = WIDTH / HEIGHT;
  const rgb = new Uint8Array(TILE * TILE * 3);
  const sun = sunOnScreen(cam);
  for (let y = top; y < top + TILE; y += block) {
    for (let x = left; x < left + TILE; x += block) {
      let sum = [0, 0, 0];
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const u = ((2 * (x + (block * (sx + 0.5)) / samples)) / WIDTH - 1) * aspect * cam.scale;
          const v = (1 - (2 * (y + (block * (sy + 0.5)) / samples)) / HEIGHT) * cam.scale;
          const dir = norm(add(cam.forward, add(mul(cam.right, u), mul(cam.up, v))));
          sum = add(sum, trace(cam.eye, dir, 0));
        }
      }
      const traced = mul(sum, 1 / (samples * samples));
      // Fill the block; the flare is cheap, so it stays sharp at full resolution.
      for (let py = y; py < y + block; py++) {
        for (let px = x; px < x + block; px++) {
          let color = traced;
          if (sun) {
            color = add(color, flare(sun, (2 * (px + 0.5)) / WIDTH - 1, 1 - (2 * (py + 0.5)) / HEIGHT));
          }
          let i = ((py - top) * TILE + (px - left)) * 3;
          for (let c = 0; c < 3; c++) {
            // Gamma correction for a more natural look.
            rgb[i++] = Math.min(255, Math.round(Math.sqrt(color[c]) * 255));
          }
        }
      }
    }
  }
  return rgb;
}

/** All tiles, ordered in a spiral from the center outwards. */
export function tiles() {
  const columns = WIDTH / TILE;
  const rows = HEIGHT / TILE;
  const list = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const dx = column + 0.5 - columns / 2;
      const dy = (row + 0.5 - rows / 2) * (columns / rows);
      list.push({ column, row, distance: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) });
    }
  }
  return list.sort((a, b) => a.distance - b.distance || a.angle - b.angle);
}
