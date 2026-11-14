import { BLAST_TIME, DECK, PLAYER_Z, VIEW } from "./game";

export const WIDTH = 640;
export const HEIGHT = 360;

/** Isometric projection: forward runs up and to the right, sideways down and to the right. */
const SCALE = 0.9;
const CX = 150;
const CY = 250;
const COS = 0.866 * SCALE;
const SIN = 0.5 * SCALE;

/** The fortress begins here; before that, the ship crosses open space. */
const DECK_START = 120;
/** Depth of the fortress hull below its deck. */
const HULL = 26;
const TILE_X = 35;
const TILE_Z = 40;

const round = (n) => Math.round(n * 10) / 10;

/** Screen position of a point x (sideways), z (ahead of the camera), h (altitude). */
const project = (x, z, h) => [round(CX + (z + x) * COS), round(CY + (x - z) * SIN - h * SCALE)];

const points = (...corners) => corners.map((c) => project(...c).join(",")).join(" ");

/** An SVG path through world points, as separate strokes: [[a, b], [c, d], ...]. */
const strokes = (pairs) =>
  pairs.map(([a, b]) => `M${project(...a).join(",")}L${project(...b).join(",")}`).join("");

/** A stable pseudo random number in [0, 1) for two integers, e.g. a deck tile. */
function hash(a, b) {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Gradients shared by all frames, rendered once outside the animated screen. */
export function Defs() {
  return (
    <svg class="defs" width="0" height="0" aria-hidden="true">
      <defs>
        <radialGradient id="sf-space" cx="30%" cy="80%" r="90%">
          <stop offset="0" stop-color="#1e1b4b" />
          <stop offset="0.5" stop-color="#0b1026" />
          <stop offset="1" stop-color="#020409" />
        </radialGradient>
        <linearGradient id="sf-tank" x1="0" x2="1">
          <stop offset="0" stop-color="#14532d" />
          <stop offset="0.35" stop-color="#4ade80" />
          <stop offset="0.6" stop-color="#22c55e" />
          <stop offset="1" stop-color="#14532d" />
        </linearGradient>
        <radialGradient id="sf-dome" cx="35%" cy="30%" r="70%">
          <stop offset="0" stop-color="#fecaca" />
          <stop offset="0.4" stop-color="#ef4444" />
          <stop offset="1" stop-color="#7f1d1d" />
        </radialGradient>
        <radialGradient id="sf-flak">
          <stop offset="0" stop-color="#fff7ed" />
          <stop offset="0.4" stop-color="#fb923c" />
          <stop offset="1" stop-color="#ea580c" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="sf-blast">
          <stop offset="0" stop-color="#fff" />
          <stop offset="0.35" stop-color="#fde047" />
          <stop offset="0.7" stop-color="#f97316" />
          <stop offset="1" stop-color="#b91c1c" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="sf-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#334155" />
          <stop offset="1" stop-color="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Stars in three layers; they drift down and to the left as the ship flies on. */
const STARS = Array.from({ length: 90 }, (_, i) => [
  hash(i, 1) * WIDTH,
  hash(i, 2) * HEIGHT,
  0.6 + hash(i, 3) * 1.6,
]);

function Stars({ camera, clock }) {
  return (
    <g class="stars">
      {STARS.map(([x, y, size], i) => {
        const travel = camera * 0.12 * size;
        const sx = (((x - travel * 0.87) % WIDTH) + WIDTH) % WIDTH;
        const sy = (((y + travel * 0.5) % HEIGHT) + HEIGHT) % HEIGHT;
        const twinkle = size > 1.8 && Math.floor(clock * 3 + i) % 4 === 0;
        return (
          <rect
            class={twinkle ? "star bright" : "star"}
            x={round(sx)}
            y={round(sy)}
            width={round(size)}
            height={round(size)}
          />
        );
      })}
    </g>
  );
}

/** One painted detail on a deck tile: vents, landing chevrons, hatches and lamps. */
function TileDetail({ kind, x0, x1, z0, z1, clock, seed }) {
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  if (kind === "vent") {
    const slats = [];
    for (let z = z0 + 9; z < z1 - 6; z += 5) {
      slats.push([
        [x0 + 7, z, 0],
        [x1 - 7, z, 0],
      ]);
    }
    return (
      <>
        <polygon
          class="vent"
          points={points(
            [x0 + 6, z0 + 6, 0],
            [x0 + 6, z1 - 6, 0],
            [x1 - 6, z1 - 6, 0],
            [x1 - 6, z0 + 6, 0],
          )}
        />
        <path class="slats" d={strokes(slats)} />
      </>
    );
  }
  if (kind === "chevron") {
    return (
      <polygon
        class="chevron"
        points={points(
          [cx - 11, cz - 9, 0],
          [cx, cz + 1, 0],
          [cx + 11, cz - 9, 0],
          [cx + 11, cz - 3, 0],
          [cx, cz + 7, 0],
          [cx - 11, cz - 3, 0],
        )}
      />
    );
  }
  if (kind === "hatch") {
    return (
      <>
        <polygon
          class="hatch"
          points={points(
            [cx - 9, cz - 10, 0],
            [cx - 9, cz + 10, 0],
            [cx + 9, cz + 10, 0],
            [cx + 9, cz - 10, 0],
          )}
        />
        <path
          class="hatch-line"
          d={strokes([
            [
              [cx, cz - 10, 0],
              [cx, cz + 10, 0],
            ],
          ])}
        />
      </>
    );
  }
  if (kind === "lamp") {
    const [x, y] = project(cx, cz, 0);
    const on = Math.floor(clock * 2 + seed * 10) % 2 === 0;
    return <circle class={on ? "lamp on" : "lamp"} cx={x} cy={y} r={on ? 2.6 : 1.8} />;
  }
  return null;
}

/** The fortress: deck plates, a parapet on the far edge and a hull with lit windows. */
function Fortress({ camera, clock }) {
  const near = Math.max(-100, DECK_START - camera);
  const far = VIEW + 60;
  if (near >= far) {
    return null;
  }

  const tiles = [];
  for (let row = Math.floor((camera + near) / TILE_Z); row * TILE_Z < camera + far; row++) {
    const top = row * TILE_Z - camera;
    const z0 = Math.max(top, near);
    const z1 = Math.min(top + TILE_Z, far);
    const whole = z0 === top && z1 === top + TILE_Z;
    for (let col = 0; col < 4; col++) {
      const x0 = -DECK + col * TILE_X;
      const x1 = x0 + TILE_X;
      const r = hash(row, col);
      const kind =
        r < 0.07 ? "vent" : r < 0.12 ? "chevron" : r < 0.17 ? "hatch" : r < 0.24 ? "lamp" : "";
      tiles.push(
        <polygon
          class={`tile ${(row + col) % 2 ? "a" : "b"}`}
          points={points([x0, z0, 0], [x0, z1, 0], [x1, z1, 0], [x1, z0, 0])}
        />,
      );
      if (whole && kind) {
        tiles.push(<TileDetail {...{ kind, x0, x1, z0, z1, clock, seed: r }} />);
      }
    }
  }

  // Windows in the hull, some lit and some dark, and a few blinking.
  const windows = [];
  for (let z = Math.ceil((camera + near) / 16) * 16; z < camera + far - 10; z += 16) {
    const r = hash(z / 16, 7);
    const lit = r > 0.35 || (r > 0.25 && Math.floor(clock * 1.5 + r * 9) % 2 === 0);
    const zr = z - camera;
    windows.push(
      <polygon
        class={lit ? "window lit" : "window"}
        points={points([DECK, zr, -7], [DECK, zr + 8, -7], [DECK, zr + 8, -13], [DECK, zr, -13])}
      />,
    );
  }
  const ribs = [];
  for (let z = Math.ceil((camera + near) / 48) * 48; z < camera + far; z += 48) {
    ribs.push([
      [DECK, z - camera - 4, 0],
      [DECK, z - camera - 4, -HULL],
    ]);
  }

  return (
    <g class="fortress">
      {near > -100 && (
        <polygon
          class="hull front"
          points={points(
            [-DECK - 6, near, 0],
            [DECK, near, 0],
            [DECK, near, -HULL],
            [-DECK - 6, near, -HULL],
          )}
        />
      )}
      <polygon
        class="hull side"
        points={points([DECK, near, 0], [DECK, far, 0], [DECK, far, -HULL], [DECK, near, -HULL])}
      />
      <path class="ribs" d={strokes(ribs)} />
      {windows}
      <path
        class="hull-line"
        d={strokes([
          [
            [DECK, near, -18],
            [DECK, far, -18],
          ],
        ])}
      />
      {tiles}
      <path
        class="seams"
        d={strokes(
          [1, 2, 3].map((c) => [
            [-DECK + c * TILE_X, near, 0],
            [-DECK + c * TILE_X, far, 0],
          ]),
        )}
      />
      {/* The parapet on the far edge. */}
      <polygon
        class="parapet top"
        points={points(
          [-DECK - 6, near, 6],
          [-DECK - 6, far, 6],
          [-DECK, far, 6],
          [-DECK, near, 6],
        )}
      />
      <polygon
        class="parapet side"
        points={points([-DECK, near, 0], [-DECK, far, 0], [-DECK, far, 6], [-DECK, near, 6])}
      />
      {near > -100 && (
        <polygon
          class="parapet front"
          points={points(
            [-DECK - 6, near, 0],
            [-DECK, near, 0],
            [-DECK, near, 6],
            [-DECK - 6, near, 6],
          )}
        />
      )}
      <polygon
        class="edge"
        points={points([DECK - 2, near, 0], [DECK - 2, far, 0], [DECK, far, 0], [DECK, near, 0])}
      />
    </g>
  );
}

/** A box seen from above: its front, its right side and its top. */
function Box({ x0, x1, z0, z1, h0, h1 }) {
  return (
    <>
      <polygon
        class="front"
        points={points([x0, z0, h0], [x1, z0, h0], [x1, z0, h1], [x0, z0, h1])}
      />
      <polygon
        class="right"
        points={points([x1, z0, h0], [x1, z1, h0], [x1, z1, h1], [x1, z0, h1])}
      />
      <polygon
        class="top"
        points={points([x0, z0, h1], [x0, z1, h1], [x1, z1, h1], [x1, z0, h1])}
      />
    </>
  );
}

/**
 * An aircraft built from flat panels in local coordinates (sideways, forward,
 * up). `dir` is 1 for the player flying forward and -1 for fighters coming head-on.
 */
function Ship({ x, z, h, dir, clock, class: name }) {
  const at = (side, fwd, up) => [x + side * dir * 1.3, z + fwd * dir * 1.3, h + up * 1.3];
  const panel = (cls, ...corners) => (
    <polygon class={cls} points={points(...corners.map((c) => at(...c)))} />
  );
  const flame = 5 + Math.abs(Math.sin(clock * 40)) * 5;
  return (
    <g class={`ship ${name}`}>
      {panel("flame", [-1.8, -9, 1], [0, -9 - flame, 1], [1.8, -9, 1])}
      {panel("wing far", [0, 5, 0.5], [-14, -6, 0], [-13, -9, 0], [0, -6, 0.5])}
      {panel("wing near", [0, 5, 0.5], [14, -6, 0], [13, -9, 0], [0, -6, 0.5])}
      {panel("stripe", [-10, -4, 0.2], [-12, -6, 0.2], [-11.5, -7.5, 0.2], [-9, -5.5, 0.2])}
      {panel("stripe", [10, -4, 0.2], [12, -6, 0.2], [11.5, -7.5, 0.2], [9, -5.5, 0.2])}
      {panel("body far", [0, 15, 1], [-3.2, 1, 2], [-2.2, -9, 1.5], [0, -9, 2.5])}
      {panel("body near", [0, 15, 1], [3.2, 1, 2], [2.2, -9, 1.5], [0, -9, 2.5])}
      {panel("canopy", [0, 9, 2.6], [-1.7, 3, 3.2], [0, -0.5, 3.8], [1.7, 3, 3.2])}
      {panel("fin", [0, -3, 2.5], [0, -11, 9], [0, -11, 2])}
    </g>
  );
}

/** A cylinder standing on the deck, e.g. a fuel tank, seen from above. */
function Cylinder({ x, z, r, h0, h1, detail }) {
  const rx = round(Math.SQRT2 * r * COS);
  const ry = round(Math.SQRT2 * r * SIN);
  const [bx, by] = project(x, z, h0);
  const [tx, ty] = project(x, z, h1);
  return (
    <>
      <path
        class="barrel"
        d={`M${bx - rx},${by}A${rx},${ry} 0 0 0 ${bx + rx},${by}L${tx + rx},${ty}L${tx - rx},${ty}Z`}
      />
      {detail(rx, ry, tx, ty)}
      <ellipse class="lid" cx={tx} cy={ty} rx={rx} ry={ry} />
      <ellipse class="cap" cx={tx} cy={ty} rx={round(rx * 0.45)} ry={round(ry * 0.45)} />
    </>
  );
}

/** A turret, fuel tank, radar dish, wall block or fighter. */
function Thing({ thing: t, state }) {
  const camera = state.z;
  const z = t.z - camera;
  const bounds = {
    x0: t.x - t.w / 2,
    x1: t.x + t.w / 2,
    z0: z - t.d / 2,
    z1: z + t.d / 2,
    h0: t.h0,
    h1: t.h1,
  };

  if (t.type === "plane") {
    return <Ship x={t.x} z={z} h={(t.h0 + t.h1) / 2} dir={-1} clock={state.clock} class="plane" />;
  }

  if (t.type === "wall") {
    const { x0, x1, z0, z1, h0, h1 } = bounds;
    // Bricks on the front face, offset row by row.
    const bricks = [];
    for (let h = h0 + 7, row = 0; h < h1; h += 7, row++) {
      bricks.push([
        [x0, z0, h],
        [x1, z0, h],
      ]);
    }
    for (let h = h0, row = 0; h < h1; h += 7, row++) {
      for (let x = x0 + (row % 2 ? 6 : 12); x < x1 - 1; x += 12) {
        bricks.push([
          [x, z0, h],
          [x, z0, Math.min(h + 7, h1)],
        ]);
      }
    }
    const gate = h0 > 0;
    const lights = [x0 + 2, x1 - 2].map((x, i) => {
      const [cx, cy] = project(x, (z0 + z1) / 2, h1);
      const on = Math.floor(state.clock * 3 + i) % 2 === 0;
      return <circle class={on ? "beacon on" : "beacon"} cx={cx} cy={cy - 1.5} r="2" />;
    });
    return (
      <g class="thing wall">
        <Box {...bounds} />
        <path class="bricks" d={strokes(bricks)} />
        {!gate && lights}
        {gate && (
          // A force field crackles under the lintel of the gate.
          <path
            class="field"
            d={(() => {
              const parts = [];
              const steps = 8;
              for (let i = 0; i <= steps; i++) {
                const x = x0 + ((x1 - x0) * i) / steps;
                const jitter = (hash(i, Math.floor(state.clock * 20)) - 0.5) * 5;
                parts.push(project(x, (z0 + z1) / 2, h0 - 1 + jitter).join(","));
              }
              return `M${parts.join("L")}`;
            })()}
          />
        )}
      </g>
    );
  }

  if (t.type === "fuel") {
    return (
      <g class="thing fuel">
        <Cylinder
          x={t.x}
          z={z}
          r={t.w / 2}
          h0={0}
          h1={t.h1}
          detail={(rx, ry, tx, ty) => (
            <>
              <path
                class="band"
                d={`M${tx - rx},${round(ty + 4)}A${rx},${ry} 0 0 0 ${tx + rx},${round(ty + 4)}`}
              />
              <text x={tx} y={round(ty + ry + 9)}>
                FUEL
              </text>
            </>
          )}
        />
      </g>
    );
  }

  if (t.type === "turret") {
    const [cx, cy] = project(t.x, z, t.h1);
    // The barrel points at the ship.
    const dx = state.x - t.x;
    const dz = PLAYER_Z - z;
    const length = Math.hypot(dx, dz) || 1;
    const [ex, ey] = project(t.x + (dx / length) * 10, z + (dz / length) * 10, t.h1 + 3);
    const flash = state.clock - t.fired < 0.08;
    return (
      <g class="thing turret">
        <Box {...bounds} />
        <path
          class="rim"
          d={strokes([
            [
              [bounds.x0, bounds.z0, t.h1 - 2],
              [bounds.x1, bounds.z0, t.h1 - 2],
            ],
            [
              [bounds.x1, bounds.z0, t.h1 - 2],
              [bounds.x1, bounds.z1, t.h1 - 2],
            ],
          ])}
        />
        <line class="gun" x1={cx} y1={round(cy - 3)} x2={ex} y2={ey} />
        <path class="dome" d={`M${round(cx - 5)},${cy}A5,5 0 0 1 ${round(cx + 5)},${cy}Z`} />
        {flash && <circle class="muzzle" cx={ex} cy={ey} r="4" />}
      </g>
    );
  }

  // A radar dish that sweeps around.
  const [cx, cy] = project(t.x, z, t.h1);
  const turn = Math.cos(state.clock * 2.5 + t.id);
  return (
    <g class="thing radar">
      <Box {...bounds} />
      <line class="mast" x1={cx} y1={cy} x2={cx} y2={cy - 9} />
      <ellipse class="dish" cx={cx} cy={cy - 12} rx={round(1 + Math.abs(turn) * 9)} ry="6" />
      <line class="feed" x1={cx} y1={cy - 12} x2={round(cx + turn * 6)} y2={cy - 17} />
    </g>
  );
}

/**
 * Orders two drawables like a painter: whatever lies farther ahead, farther to
 * the left or lower comes first and is covered by the rest.
 */
function behind(a, b) {
  if (a.z0 >= b.z1) {
    return -1;
  }
  if (b.z0 >= a.z1) {
    return 1;
  }
  if (a.x1 <= b.x0) {
    return -1;
  }
  if (b.x1 <= a.x0) {
    return 1;
  }
  return a.h0 - b.h0;
}

/** Light falls from the upper left, so things cast shadows down and to the right. */
function Shadow({ t, camera }) {
  const z = t.z - camera;
  const x0 = t.x - t.w / 2;
  const x1 = t.x + t.w / 2;
  const z0 = z - t.d / 2;
  const z1 = z + t.d / 2;
  const s = Math.min(t.h1, 30) * 0.5;
  return (
    <polygon
      class="cast"
      points={points(
        [x0, z1, 0],
        [x1 + s, z1 - s * 0.4, 0],
        [x1 + s, z0 - s * 0.4, 0],
        [x0 + s, z0 - s * 0.4, 0],
        [x0, z0, 0],
      )}
    />
  );
}

/** An explosion: a flash, a shock ring and debris that flies off and falls. */
function Blast({ blast: b, camera }) {
  const p = b.age / BLAST_TIME;
  const [cx, cy] = project(b.x, b.z - camera, b.h);
  const size = b.big ? 1.6 : 1;
  const debris = Array.from({ length: b.big ? 14 : 9 }, (_, i) => {
    const angle = (i / (b.big ? 14 : 9)) * Math.PI * 2 + hash(b.id, i) * 0.6;
    const speed = (25 + hash(i, b.id) * 45) * size;
    const t = b.age;
    const h = Math.max(0, b.h + (30 + hash(b.id, i + 50) * 40) * t - 90 * t * t);
    const [x, y] = project(
      b.x + Math.cos(angle) * speed * t,
      b.z - camera + Math.sin(angle) * speed * t,
      h,
    );
    const s = round(1.5 + hash(i, b.id + 9) * 2.5);
    return <rect class={i % 3 ? "debris" : "debris hot"} x={x} y={y} width={s} height={s} />;
  });
  return (
    <g class="blast" opacity={round(Math.min(1, 1.6 - p * 1.6))}>
      <circle class="fireball" cx={cx} cy={cy} r={round((6 + p * 22) * size)} />
      <circle class="ring" cx={cx} cy={cy} r={round((4 + p * 40) * size)} />
      {debris}
    </g>
  );
}

/** The whole scene for one frame, projected into an SVG. */
export default function Scene({ state }) {
  const camera = state.z;
  const drawables = [];
  const box = (x, z, w, d, h0, h1, node) =>
    drawables.push({
      x0: x - w / 2,
      x1: x + w / 2,
      z0: z - d / 2,
      z1: z + d / 2,
      h0,
      h1,
      node,
    });

  const things = state.things.filter((t) => t.z - camera > -90 && t.z - camera < VIEW + 40);
  for (const t of things) {
    box(t.x, t.z - camera, t.w, t.d, t.h0, t.h1, <Thing thing={t} state={state} />);
  }
  for (const shot of state.shots) {
    const z = shot.z - camera;
    const pair = (offset) => {
      const [x1, y1] = project(shot.x + offset, z - 7, shot.h + 1);
      const [x2, y2] = project(shot.x + offset, z + 7, shot.h + 1);
      return { x1, y1, x2, y2 };
    };
    box(
      shot.x,
      z,
      8,
      14,
      shot.h,
      shot.h,
      <>
        <line class="shot-glow" {...pair(-4)} />
        <line class="shot-glow" {...pair(4)} />
        <line class="shot" {...pair(-4)} />
        <line class="shot" {...pair(4)} />
      </>,
    );
  }
  for (const f of state.flak) {
    const [cx, cy] = project(f.x, f.z - camera, f.h);
    const r = round(4 + Math.sin(f.age * 30) * 1);
    box(f.x, f.z - camera, 3, 3, f.h, f.h, <circle class="flak" cx={cx} cy={cy} r={r} />);
  }
  // The ship blinks while it is protected after a crash.
  const visible =
    state.status !== "over" && (state.safe <= 0 || Math.floor(state.safe * 8) % 2 === 0);
  if (visible) {
    box(
      state.x,
      PLAYER_Z,
      28,
      26,
      state.h,
      state.h + 9,
      <Ship x={state.x} z={PLAYER_Z} h={state.h} dir={1} clock={state.clock} class="player" />,
    );
  }
  drawables.sort(behind);

  // Over the deck, shadows tell how high everything flies; over space there is nothing to fall on.
  const onDeck = (z) => z + camera >= DECK_START;
  const fliers = things.filter((t) => t.type === "plane");
  const [sx, sy] = project(state.x, PLAYER_Z, 0);
  const [px, py] = project(state.x, PLAYER_Z, state.h);

  return (
    <svg class="scene" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice">
      <rect class="space" width={WIDTH} height={HEIGHT} />
      <Stars camera={camera} clock={state.clock} />
      <Fortress camera={camera} clock={state.clock} />
      {things
        .filter((t) => t.type !== "plane")
        .map((t) => (
          <Shadow t={t} camera={camera} />
        ))}
      {fliers
        .filter((t) => onDeck(t.z - camera))
        .map((t) => {
          const [x, y] = project(t.x, t.z - camera, 0);
          return <ellipse class="shadow" cx={x} cy={y} rx="12" ry="5" />;
        })}
      {visible && onDeck(PLAYER_Z) && (
        <>
          <line class="altitude" x1={sx} y1={sy} x2={px} y2={py} />
          <ellipse class="shadow player" cx={sx} cy={sy} rx="13" ry="5.5" />
        </>
      )}
      {drawables.map((d) => d.node)}
      {state.blasts.map((b) => (
        <Blast blast={b} camera={camera} />
      ))}
    </svg>
  );
}
