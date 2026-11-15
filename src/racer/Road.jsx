import {
  CAMERA_HEIGHT,
  CAR_WIDTH,
  COW,
  DEPTH,
  DRAW_DISTANCE,
  lerp,
  MAX_SPEED,
  PLAYER_Z,
  ROAD,
  SEGMENT,
  segmentAt,
  TRACK,
  TRACK_LENGTH,
} from "./game";
import { BILLBOARDS } from "./Sprites";

export const WIDTH = 640;
export const HEIGHT = 360;

const round = (n) => Math.round(n * 10) / 10;

/** Two rows of mountains as one tileable outline, twice the screen wide. */
function ridge(seed, base, amplitude) {
  const points = [];
  for (let i = 0; i <= 32; i++) {
    const x = (i / 32) * WIDTH * 2;
    // Whole waves only, so the outline joins seamlessly with the next tile.
    const a = (i / 32) * Math.PI * 2;
    const y =
      base - amplitude * (0.5 + 0.3 * Math.sin(a * 3 + seed) + 0.2 * Math.sin(a * 7 + seed * 2));
    points.push(`${round(x)},${round(y)}`);
  }
  return `0,${HEIGHT} ${points.join(" ")} ${WIDTH * 2},${HEIGHT}`;
}
const FAR = ridge(1.3, 175, 60);
const NEAR = ridge(2.1, 185, 30);

/** Mountains scroll sideways in curves, the far ones slower than the near ones. */
function Mountains({ sky, horizon }) {
  const shift = (/** @type {number} */ factor) =>
    -(((sky * factor * WIDTH) % (WIDTH * 2)) + WIDTH * 2) % (WIDTH * 2);
  return (
    <>
      {[
        { name: "far", points: FAR, factor: 0.5 },
        { name: "near", points: NEAR, factor: 1 },
      ].map(({ name, points, factor }) => (
        <g
          class={`mountains ${name}`}
          transform={`translate(${round(shift(factor))} ${round(horizon)})`}
        >
          <polygon points={points} />
          <polygon points={points} transform={`translate(${WIDTH * 2} 0)`} />
        </g>
      ))}
    </>
  );
}

/** Clouds at fixed heights; higher ones are farther away, so smaller and slower. */
const CLOUDS = [
  { x: 40, y: 38, size: 120, speed: 6 },
  { x: 260, y: 22, size: 80, speed: 4 },
  { x: 430, y: 60, size: 150, speed: 8 },
  { x: 620, y: 30, size: 95, speed: 5 },
  { x: 760, y: 82, size: 170, speed: 10 },
];
/** Clouds wrap around this width, so they leave on one side and return on the other. */
const SKY_WIDTH = WIDTH + 400;

/**
 * Clouds drift slowly on the wind with the race clock and also scroll
 * sideways in curves, like the mountains but less, as they are farther away.
 */
function Clouds({ clock, sky }) {
  return (
    <g class="clouds">
      {CLOUDS.map((cloud) => {
        const travel = cloud.x + clock * cloud.speed - sky * WIDTH * 0.3 * (cloud.size / 150);
        const x = (((travel % SKY_WIDTH) + SKY_WIDTH) % SKY_WIDTH) - 200;
        return (
          <use
            href="#cloud"
            x={round(x)}
            y={cloud.y}
            width={cloud.size}
            height={round(cloud.size * 0.45)}
          />
        );
      })}
    </g>
  );
}

/** Seconds between two appearances of the bird, and how long it takes to cross. */
const BIRD_EVERY = 15;
const BIRD_FLIGHT = 6;

/**
 * Now and then a bird flies across the sky, alternately from either side,
 * gliding through the air and flapping its long wing. Like everything else, it is
 * derived from the race clock alone.
 */
function Bird({ clock }) {
  // Start a few seconds into the race, not right at the lights.
  const time = clock - 5;
  if (time < 0) return null;
  const flight = Math.floor(time / BIRD_EVERY);
  const t = (time % BIRD_EVERY) / BIRD_FLIGHT;
  if (t >= 1) return null;
  const leftwards = flight % 2 === 1;
  const progress = leftwards ? 1 - t : t;
  const x = -30 + progress * (WIDTH + 60);
  // Each flight takes its own height and gently climbs or sinks.
  const y =
    50 + ((flight * 37) % 50) + (leftwards ? 1 : -1) * t * 25 + Math.abs(Math.sin(t * 12)) * -10;
  const wings = Math.floor(clock * 10) % 2 ? "bird-up" : "bird-down";
  return (
    <use
      href={`#${wings}`}
      x="-21"
      y="-18"
      width="42"
      height="36"
      transform={`translate(${round(x)} ${round(y)})${leftwards ? " scale(-1 1)" : ""}`}
    />
  );
}

const SUN_Y = 70;

/** Twelve thin rays around the sun, as one path. */
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const point = (angle, r) => `${round(Math.cos(angle) * r)},${round(Math.sin(angle) * r)}`;
  return `M${point(a - 0.06, 30)} L${point(a, i % 2 ? 70 : 95)} L${point(a + 0.06, 30)} Z`;
}).join(" ");

/** The sun with a pulsing glow and slowly turning rays, all from the race clock. */
function Sun({ x, clock }) {
  const pulse = Math.sin(clock * 2);
  return (
    <g transform={`translate(${round(x)} ${SUN_Y})`}>
      <circle class="sun-glow" r={round(70 + pulse * 6)} />
      <path class="sun-rays" d={RAYS} transform={`rotate(${round(clock * 8)})`} />
      <circle class="sun" r="26" />
    </g>
  );
}

/** Ghosts of the sun along the line through the center of the screen, like in a camera lens. */
const FLARES = [
  { t: 0.45, r: 6, color: "#fde68a" },
  { t: 0.8, r: 16, color: "#a5f3fc" },
  { t: 1.15, r: 9, color: "#f9a8d4" },
  { t: 1.6, r: 28, color: "#c4b5fd" },
  { t: 1.85, r: 12, color: "#fde68a" },
];

/**
 * A lens flare drawn over everything. It's strongest while the sun is near
 * the middle of the screen and fades out as the sun moves towards the edge.
 */
function Flare({ x, clock }) {
  const strength = 1 - Math.min(1, Math.abs(x - WIDTH / 2) / (WIDTH / 2 + 40));
  if (strength <= 0.05) return null;
  const dx = WIDTH / 2 - x;
  const dy = HEIGHT / 2 - SUN_Y;
  const flicker = 0.9 + Math.sin(clock * 7) * 0.1;
  return (
    <g class="flare" opacity={round(strength * flicker * 100) / 100}>
      {FLARES.map(({ t, r, color }) => (
        <circle cx={round(x + dx * t)} cy={round(SUN_Y + dy * t)} r={r} fill={color} />
      ))}
    </g>
  );
}

/** Projects a point of the world onto the screen. */
function project(worldX, worldY, worldZ, cameraX, cameraY, cameraZ) {
  const scale = DEPTH / (worldZ - cameraZ);
  return {
    x: WIDTH / 2 + scale * (worldX - cameraX) * (WIDTH / 2),
    y: HEIGHT / 2 - scale * (worldY - cameraY) * (HEIGHT / 2),
    w: scale * ROAD * (WIDTH / 2),
    scale,
    z: worldZ - cameraZ,
  };
}

const trapezoid = (x1, y1, w1, x2, y2, w2) =>
  `${round(x1 - w1)},${round(y1)} ${round(x1 + w1)},${round(y1)} ${round(x2 + w2)},${round(y2)} ${round(x2 - w2)},${round(y2)}`;

/** One slice of road: grass, rumble strips, asphalt and lane markers. */
function Slice({ index, p1, p2 }) {
  const shade = Math.floor(index / 3) % 2 ? "dark" : "light";
  const lane = (n) => {
    const at = (p) => p.x - p.w + (p.w * 2 * n) / 3;
    return trapezoid(at(p1), p1.y, p1.w / 40, at(p2), p2.y, p2.w / 40);
  };
  return (
    <>
      <rect
        class={`grass ${shade}`}
        x="0"
        y={round(p2.y)}
        width={WIDTH}
        height={round(p1.y - p2.y + 1)}
      />
      <polygon
        class={`rumble ${shade}`}
        points={trapezoid(p1.x, p1.y, p1.w * 1.15, p2.x, p2.y, p2.w * 1.15)}
      />
      <polygon
        class={`asphalt ${index < 3 ? "start" : shade}`}
        points={trapezoid(p1.x, p1.y, p1.w, p2.x, p2.y, p2.w)}
      />
      {shade === "light" && index >= 3 && (
        <>
          <polygon class="lane" points={lane(1)} />
          <polygon class="lane" points={lane(2)} />
        </>
      )}
    </>
  );
}

/** Sprites that cast one shadow; billboards cast one per post, crowds stand behind barriers. */
const SHADOWS = new Set(["tree", "pine", "bush", "car"]);

/**
 * A flat shadow on the ground, cast away from the sun. Taller things cast
 * longer shadows, and as the sun moves across the sky in curves, the shadows
 * swing around. It's a single plain ellipse without blur filters, so it costs
 * next to nothing per frame.
 */
function Shadow({ x, y, w, h, sun }) {
  if (w < 2) return null;
  const dir = Math.max(-1, Math.min(1, (x - sun) / (WIDTH / 2)));
  return (
    <ellipse
      class="shadow"
      cx={round(x + dir * h * 0.35)}
      cy={round(y)}
      rx={round(w * 0.45 + Math.abs(dir) * h * 0.25)}
      ry={round(Math.max(1, w * 0.08))}
    />
  );
}

/** A sprite standing on the road, anchored at its bottom center. */
function Thing({ type, symbol = type, x, y, scale, width, height, sun, color = "" }) {
  const w = scale * width * (WIDTH / 2);
  const h = scale * height * (WIDTH / 2);
  if (w < 1 || w > WIDTH * 4) return null;
  return (
    <>
      {SHADOWS.has(type) && <Shadow x={x} y={y} w={w} h={h} sun={sun} />}
      {type === "billboard" &&
        // One thin shadow per post; the posts stand at 24 and 126 of the 150 wide artwork.
        [-0.34, 0.34].map((post) => <Shadow x={x + post * w} y={y} w={w * 0.12} h={h} sun={sun} />)}
      <use
        href={`#${symbol}`}
        class={color && `car ${color}`}
        x={round(x - w / 2)}
        y={round(y - h)}
        width={round(w)}
        height={round(h)}
      />
    </>
  );
}

/**
 * A cow standing on a segment of the road, facing the way it walks. Its legs
 * step in turns, and it moos when it gets hit, or just now and then.
 */
function Cow({ cow, p1, p2, clock, sun }) {
  const p = (cow.z % SEGMENT) / SEGMENT;
  const scale = lerp(p1.scale, p2.scale, p);
  const w = scale * COW.width * (WIDTH / 2);
  const h = scale * COW.height * (WIDTH / 2);
  if (w < 2 || w > WIDTH * 4) return null;
  const x = lerp(p1.x, p2.x, p) + cow.offset * lerp(p1.w, p2.w, p);
  const y = lerp(p1.y, p2.y, p);
  const step = Math.floor(clock * 4) % 2 ? "cow-a" : "cow-b";
  const moo = cow.hit || clock % 3 < 1;
  return (
    <>
      <Shadow x={x} y={y} w={w * 0.8} h={h} sun={sun} />
      <use
        href={`#${step}`}
        x={round(x - w / 2)}
        y={round(y - h)}
        width={round(w)}
        height={round(h)}
        transform={cow.dir < 0 ? `translate(${round(x * 2)} 0) scale(-1 1)` : undefined}
      />
      {moo && w > 20 && <Moo x={x} y={y} w={w} h={h} dir={cow.dir} loud={cow.hit} />}
    </>
  );
}

/**
 * A speech bubble whose tail points down at the cow's head. The bubble sits
 * on the side the cow faces; only the tail is mirrored, never the text.
 */
function Moo({ x, y, w, h, dir, loud }) {
  // The top of the head in the cow's artwork, which is 96 × 60 and faces right.
  const headX = x + dir * w * (82 / 96 - 0.5);
  const headY = y - h + h * (6 / 60);
  // Bubble units per pixel, and the tail's tip in bubble units.
  const k = w / 90;
  const tip = { x: -8 * dir, y: 18 };
  const tail = `M${-2 * dir} 8 L${tip.x} ${tip.y} L${-12 * dir} 8 Z`;
  return (
    <g
      class="moo"
      transform={`translate(${round(headX - tip.x * k)} ${round(headY - tip.y * k)}) scale(${k.toFixed(3)})`}
    >
      <path d={tail} />
      <rect x="-28" y="-13" width="56" height="22" rx="11" />
      {/* Covers the outline where tail and bubble meet. */}
      <path class="join" d={tail} />
      <text y="3" text-anchor="middle">
        {loud ? "MOO!!" : "Moo"}
      </text>
    </g>
  );
}

/** Tread bars on the visible half of a tire, and how far the car travels while they cycle through. */
const TREADS = 8;
// At top speed (45 segments per second) and 60 frames per second, the car
// travels 150 units per frame. A bar must move clearly less than half the gap
// to the next per frame; with this distance it moves 0.4 of the gap.
const TREAD_TRAVEL = 3000;

/**
 * Tread bars on the back of the rear tires, as one path in the car's artwork
 * units (100 × 60, tires at 2 and 76, 22 wide, 30 to 58 high). A tire rolling
 * forwards turns its back side upwards, so the bars climb. They sit on a
 * cylinder seen from behind: around the middle they are far apart and full
 * height, towards the top and bottom they crowd together and thin out. Even
 * at top speed a bar moves less than half the gap per frame, so the tires
 * never seem to spin backwards.
 */
function treads(position) {
  const phase = (position / TREAD_TRAVEL) % 1;
  const parts = [];
  for (const x of [5, 79]) {
    for (let i = 0; i < TREADS; i++) {
      // Angle around the visible half of the tire: 0 at the top, π at the bottom.
      const angle = ((((i / TREADS - phase) % 1) + 1) % 1) * Math.PI;
      const height = 1.2 * Math.sin(angle);
      if (height < 0.2) continue;
      const y = 44 - 13 * Math.cos(angle) - height / 2;
      parts.push(`M${x} ${round(y)}h16v${round(height)}h-16Z`);
    }
  }
  return parts.join("");
}

/**
 * The player's car at the bottom of the screen. It bounces at speed, leans
 * into the steering and shakes after a crash.
 */
function Player({ state, sun }) {
  // On the projection plane, the scale is the same as for the camera height.
  const w = (CAR_WIDTH * ROAD * (WIDTH / 2) * DEPTH) / PLAYER_Z;
  const h = w * 0.6;
  const percent = state.speed / MAX_SPEED;
  const bounce = Math.sin(state.position / 37) * 1.5 * percent;
  const shake = state.crash ? Math.sin(state.crash * 60) * 6 : 0;
  const left = WIDTH / 2 - w / 2 + shake;
  const bottom = HEIGHT - 8 + bounce;
  return (
    <>
      <Shadow x={WIDTH / 2 + shake} y={bottom - 2} w={w} h={h} sun={sun} />
      <g transform={`rotate(${round(state.steer * 3 * percent)} ${WIDTH / 2} ${HEIGHT})`}>
        <use
          href="#car"
          class="car player red"
          x={round(left)}
          y={round(bottom - h)}
          width={round(w)}
          height={round(h)}
        />
        <path
          class="treads"
          d={treads(state.position)}
          transform={`translate(${round(left)} ${round(bottom - h)}) scale(${(w / 100).toFixed(3)})`}
        />
      </g>
      {state.drift > 0.02 && <Smoke left={left} bottom={bottom} w={w} state={state} />}
      {Math.abs(state.x) > 1 && percent > 0.05 && (
        <Dirt left={left} bottom={bottom} w={w} percent={percent} clock={state.clock} />
      )}
    </>
  );
}

const CLUMPS = 8;
/** Seconds a clump of dirt flies. */
const CLUMP_LIFE = 0.5;
const DIRT = ["#5b3a1e", "#7c4f2a", "#3f6212", "#4a2f19"];

/**
 * Dirt and bits of grass thrown up by the rear tires on the grass, more and
 * higher the faster the car goes. Like the smoke, each clump's flight comes
 * from the race clock: it is flung up and out, falls back on an arc, grows
 * as it comes towards the camera and fades out.
 */
function Dirt({ left, bottom, w, percent, clock }) {
  const wheels = [left + w * 0.13, left + w * 0.87];
  const strength = Math.min(1, percent * 1.5);
  return (
    <g class="dirt">
      {wheels.flatMap((wheel, side) =>
        Array.from({ length: CLUMPS }, (_, i) => {
          const age = (clock / CLUMP_LIFE + i / CLUMPS + side * 0.37) % 1;
          // A fixed spread per clump, so they don't fly in line.
          const spread = Math.sin(i * 3.7 + side * 1.3);
          const out = (side ? 1 : -1) * (0.15 + 0.25 * Math.abs(spread)) + spread * 0.1;
          const rise = (0.25 + 0.2 * Math.abs(Math.cos(i * 2.3))) * strength;
          return (
            <circle
              cx={round(wheel + out * age * w)}
              cy={round(bottom - 4 - (rise * age - 0.45 * strength * age * age) * w)}
              r={round(w * (0.012 + age * 0.02))}
              fill={DIRT[(i + side) % DIRT.length]}
              opacity={round(strength * (1 - age) * 100) / 100}
            />
          );
        }),
      )}
    </g>
  );
}

const PUFFS = 6;
/** Seconds a puff lives. */
const PUFF_LIFE = 0.6;

/**
 * Tire smoke while drifting. There is no particle system: each puff's age is
 * derived from the race clock, so puffs swell, spread and fade over a fixed
 * lifetime, and new ones keep appearing at the rear tires. Smoke hugs the
 * ground and rolls back towards the camera, so it's drawn in front of the
 * car and puffs mostly grow wider with age; while the car slides
 * outwards, the smoke stays behind towards the inside of the curve.
 */
function Smoke({ left, bottom, w, state }) {
  const wheels = [left + w * 0.13, left + w * 0.87];
  return (
    <g class="smoke">
      {wheels.flatMap((wheel, side) =>
        Array.from({ length: PUFFS }, (_, i) => {
          // Offset the two wheels, so their puffs don't swell in lockstep.
          const age = (state.clock / PUFF_LIFE + i / PUFFS + side * 0.5) % 1;
          // A fixed wobble per puff, so they don't line up.
          const wobble = Math.sin(i * 2.4 + side * 1.7);
          const outwards = (side ? 1 : -1) * 0.25 - state.driftSide * 0.4;
          const r = w * (0.06 + age * 0.3);
          return (
            <ellipse
              cx={round(wheel + (outwards + wobble * 0.06) * age * w)}
              cy={round(bottom - 8 - age * w * (0.1 + wobble * 0.03))}
              rx={round(r)}
              ry={round(r * 0.6)}
              opacity={
                round(Math.min(1, state.drift * 1.5) * Math.min(1, age * 5) * (1 - age) * 100) / 100
              }
            />
          );
        }),
      )}
    </g>
  );
}

/**
 * Renders the road from far to near as an SVG, like a painter: nearer slices
 * cover whatever lies behind a hilltop, so no clipping is needed.
 */
export default function Road({ state }) {
  const base = segmentAt(state.position);
  const basePercent = (state.position % SEGMENT) / SEGMENT;
  const playerSegment = segmentAt(state.position + PLAYER_Z);
  const playerPercent = ((state.position + PLAYER_Z) % SEGMENT) / SEGMENT;
  const cameraY = CAMERA_HEIGHT + lerp(playerSegment.y1, playerSegment.y2, playerPercent);

  // Cars sorted into the segments they are on.
  const traffic = new Map();
  for (const car of state.cars) {
    const segment = segmentAt(car.z);
    traffic.set(segment.index, [...(traffic.get(segment.index) || []), car]);
  }

  const rows = [];
  let maxY = HEIGHT;
  let x = 0;
  let dx = -base.curve * basePercent;
  let horizon = HEIGHT / 2;
  for (let n = 0; n < DRAW_DISTANCE; n++) {
    const segment = TRACK[(base.index + n) % TRACK.length];
    const looped = segment.index < base.index;
    const cameraZ = state.position - (looped ? TRACK_LENGTH : 0);
    const cameraX = state.x * ROAD;
    const p1 = project(x, segment.y1, segment.index * SEGMENT, cameraX, cameraY, cameraZ);
    const p2 = project(
      x + dx,
      segment.y2,
      (segment.index + 1) * SEGMENT,
      cameraX,
      cameraY,
      cameraZ,
    );
    x += dx;
    dx += segment.curve;
    if (p1.z <= DEPTH) continue;
    const visible = p2.y < p1.y && p2.y < maxY;
    if (visible) maxY = horizon = p2.y;
    rows.push({ segment, p1, p2, visible });
  }

  // The sun is farther away than anything, so it sweeps across the sky in
  // curves like the far mountains. It wraps around a span twice the screen
  // wide, so it leaves on one side and comes back on the other.
  const span = WIDTH * 2;
  const sun =
    ((((470 + (span - WIDTH) / 2 - state.sky * WIDTH * 0.5) % span) + span) % span) -
    (span - WIDTH) / 2;

  return (
    <svg
      class="road"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Road ahead, ${state.cars.length} cars on the track`}
    >
      <rect class="sky" width={WIDTH} height={HEIGHT} />
      <Sun x={sun} clock={state.clock} />
      <Clouds clock={state.clock} sky={state.sky} />
      <Mountains sky={state.sky} horizon={horizon - HEIGHT / 2} />
      <Bird clock={state.clock} />
      <rect class="grass light" y={round(horizon)} width={WIDTH} height={round(HEIGHT - horizon)} />
      {rows.reverse().map(({ segment, p1, p2, visible }) => (
        <>
          {visible && <Slice index={segment.index} p1={p1} p2={p2} />}
          {segment.sprites.map((sprite) => (
            <Thing
              type={
                // Crowds cheer in turns: each group throws its arms up on its own beat.
                sprite.type === "crowd" && Math.floor(state.clock * 5 + segment.index * 0.7) % 2
                  ? "crowd-cheer"
                  : sprite.type
              }
              symbol={
                // Billboards take turns showing their messages along the track.
                sprite.type === "billboard"
                  ? `billboard-${Math.floor(segment.index / 120) % BILLBOARDS.length}`
                  : undefined
              }
              x={p1.x + sprite.offset * p1.w}
              y={p1.y}
              scale={p1.scale}
              width={sprite.width}
              height={sprite.height}
              sun={sun}
            />
          ))}
          {(traffic.get(segment.index) || [])
            // Farther cars first, so nearer ones cover them.
            .map((car) => ({ car, p: (car.z % SEGMENT) / SEGMENT }))
            .sort((a, b) => b.p - a.p)
            .map(({ car, p }) => {
              const w = lerp(p1.w, p2.w, p);
              return (
                <Thing
                  type="car"
                  color={car.color}
                  x={lerp(p1.x, p2.x, p) + car.offset * w}
                  y={lerp(p1.y, p2.y, p)}
                  scale={lerp(p1.scale, p2.scale, p)}
                  width={CAR_WIDTH * ROAD}
                  height={CAR_WIDTH * ROAD * 0.6}
                  sun={sun}
                />
              );
            })}
          {state.cow && segmentAt(state.cow.z) === segment && (
            <Cow cow={state.cow} p1={p1} p2={p2} clock={state.clock} sun={sun} />
          )}
        </>
      ))}
      <Player state={state} sun={sun} />
      <Flare x={sun} clock={state.clock} />
      {state.crash > 0 && (
        <rect class="flash" width={WIDTH} height={HEIGHT} opacity={round(state.crash)} />
      )}
    </svg>
  );
}
