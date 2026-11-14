import { buildChunk, WATER_Y } from "./course";
import { CHUNK, HEIGHT, SAMPLE } from "./shared";

const round = (n) => Math.round(n * 10) / 10;

/** Gradients for the landscape, rendered once into the page. */
export function TerrainDefs() {
  return (
    <svg class="defs" width="0" height="0" aria-hidden="true">
      <defs>
        {/* By altitude: snow on the peaks, rock below, then grass and soil. */}
        <linearGradient
          id="am-ground"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="40"
          x2="0"
          y2="180"
        >
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.38" stop-color="#e2e8f0" />
          <stop offset="0.44" stop-color="#94a3b8" />
          <stop offset="0.56" stop-color="#64748b" />
          <stop offset="0.61" stop-color="#65a30d" />
          <stop offset="0.75" stop-color="#4d7c0f" />
          <stop offset="0.85" stop-color="#3f6212" />
          <stop offset="1" stop-color="#422006" />
        </linearGradient>
        <linearGradient id="am-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#38bdf8" />
          <stop offset="0.7" stop-color="#bae6fd" />
          <stop offset="1" stop-color="#e0f2fe" />
        </linearGradient>
        <radialGradient id="am-sun-glow">
          <stop offset="0" stop-color="#fef9c3" stop-opacity="0.9" />
          <stop offset="0.3" stop-color="#fef08a" stop-opacity="0.45" />
          <stop offset="1" stop-color="#fef08a" stop-opacity="0" />
        </radialGradient>
        {/* Paint and glass of the plane, which the browser draws on top of the landscape. */}
        <linearGradient id="am-fuselage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fef08a" />
          <stop offset="0.45" stop-color="#facc15" />
          <stop offset="1" stop-color="#b45309" />
        </linearGradient>
        <linearGradient id="am-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f87171" />
          <stop offset="1" stop-color="#b91c1c" />
        </linearGradient>
        <linearGradient id="am-cowling" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e2e8f0" />
          <stop offset="0.5" stop-color="#94a3b8" />
          <stop offset="1" stop-color="#334155" />
        </linearGradient>
        <linearGradient id="am-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e0f2fe" />
          <stop offset="1" stop-color="#38bdf8" />
        </linearGradient>
        {/* In page coordinates, so water that spans two chunks shades without a seam. */}
        <linearGradient
          id="am-water"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={WATER_Y}
          x2="0"
          y2={WATER_Y + 24}
        >
          <stop offset="0" stop-color="#38bdf8" />
          <stop offset="1" stop-color="#075985" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Seconds of the wind cycle at a world position: gusts roll across the landscape as a wave. */
const WIND_CYCLE = 4;
const gust = (worldX) => `--delay: -${round((worldX / 90) % WIND_CYCLE)}s`;

function Pine({ x, y, h, wind }) {
  const w = h * 0.45;
  return (
    <g class="pine" style={wind}>
      <rect class="trunk" x={round(x - 1)} y={round(y - 4)} width="2" height="4" />
      {[0, 1, 2].map((n) => {
        const top = y - h + n * h * 0.25;
        const bottom = top + h * 0.45;
        const half = w * (0.55 + n * 0.22);
        return (
          <polygon
            class={n === 2 ? "needles dark" : "needles"}
            points={`${round(x)},${round(top)} ${round(x + half)},${round(bottom)} ${round(x - half)},${round(bottom)}`}
          />
        );
      })}
    </g>
  );
}

function Oak({ x, y, h, wind }) {
  const r = h * 0.32;
  return (
    <g class="oak" style={wind}>
      <rect
        class="trunk"
        x={round(x - 1.2)}
        y={round(y - h * 0.5)}
        width="2.4"
        height={round(h * 0.5)}
      />
      <circle class="crown dark" cx={round(x - r * 0.6)} cy={round(y - h * 0.6)} r={round(r)} />
      <circle class="crown dark" cx={round(x + r * 0.6)} cy={round(y - h * 0.62)} r={round(r)} />
      <circle class="crown" cx={round(x)} cy={round(y - h + r)} r={round(r * 1.1)} />
    </g>
  );
}

const WALLS = ["#fde68a", "#fecaca", "#e0f2fe", "#f5f5f4"];

const ROOFS = ["#b91c1c", "#9a3412", "#475569", "#7c2d12"];
const SHUTTERS = ["#15803d", "#1d4ed8", "#7c2d12", "#0f766e"];

/** A window with a cross of mullions and a shutter on each side. */
function Window({ x, y, shutter }) {
  return (
    <>
      <rect class="shutter" x={x - 0.7} y={y} width="0.7" height="2.2" fill={shutter} />
      <rect class="shutter" x={x + 2.4} y={y} width="0.7" height="2.2" fill={shutter} />
      <rect class="window" x={x} y={y} width="2.4" height="2.2" />
      <path class="mullion" d={`M${x + 1.2},${y}v2.2M${x},${y + 1.1}h2.4`} />
      <rect class="sill" x={x - 0.3} y={y + 2.2} width="3" height="0.5" />
    </>
  );
}

/** A church: a nave with tall arched windows and a tower with belfry, clock, spire and cross. */
function Church({ x, y }) {
  const arch = (wx, top, w, h) =>
    `M${wx},${y - top + h}v${-h + w / 2}a${w / 2},${w / 2} 0 0 1 ${w},0v${h - w / 2}Z`;
  return (
    <g class="church">
      <rect class="wall" x={x - 8} y={y - 12} width="16" height="12" fill={WALLS[3]} />
      <rect class="eave-shade" x={x - 8} y={y - 12} width="16" height="1" />
      <polygon
        class="roof"
        points={`${x - 9},${y - 12} ${x + 9},${y - 12} ${x + 5},${y - 17} ${x - 5},${y - 17}`}
      />
      <path class="tiles" d={`M${x - 7.4},${y - 14}h14.8M${x - 6},${y - 15.7}h12`} />
      <path class="window" d={arch(x - 6.6, 9.5, 2.2, 6.5)} />
      <path class="window" d={arch(x - 2.6, 9.5, 2.2, 6.5)} />
      <path class="mullion" d={`M${x - 5.5},${y - 8}v5M${x - 1.5},${y - 8}v5`} />
      {/* The tower stands in front of the nave. */}
      <rect class="wall" x={x + 2} y={y - 22} width="5" height="22" fill={WALLS[3]} />
      <path class="belfry" d={arch(x + 3.5, 21.2, 2, 3)} />
      <path class="bell" d={`M${x + 4},${y - 18.6}q0.5,-1.6 1,0Z`} />
      <circle class="clock" cx={x + 4.5} cy={y - 15} r="1.3" />
      <path class="hands" d={`M${x + 4.5},${y - 15}v-0.9M${x + 4.5},${y - 15}h0.7`} />
      <path class="door" d={arch(x + 3.3, 4.6, 2.4, 4.6)} />
      <rect class="step" x={x + 2.6} y={y - 0.5} width="3.8" height="0.5" />
      <rect class="cornice" x={x + 1.5} y={y - 22.6} width="6" height="0.8" />
      <polygon
        class="spire"
        points={`${x + 1.8},${y - 22.6} ${x + 7.2},${y - 22.6} ${x + 4.5},${y - 30}`}
      />
      <path class="cross" d={`M${x + 4.5},${y - 30}v-2.6M${x + 3.7},${y - 31.6}h1.6`} />
    </g>
  );
}

/** A cottage with a tiled roof, a smoking chimney, shuttered windows and flowers. */
function House({ x, y, kind, color }) {
  if (kind === "church") {
    return <Church x={x} y={y} />;
  }
  const shutter = SHUTTERS[(color + Math.round(x)) % SHUTTERS.length];
  return (
    <g class="house">
      <g class="smoke" style={`--delay: -${(x % 7) / 2}s`}>
        <circle cx={x + 4} cy={y - 17} r="1" />
        <circle cx={x + 4.6} cy={y - 19.5} r="1.4" />
      </g>
      <rect class="chimney" x={x + 3} y={y - 15} width="2" height="4" />
      <rect class="chimney-cap" x={x + 2.6} y={y - 15.6} width="2.8" height="0.8" />
      <rect class="wall" x={x - 6} y={y - 8} width="12" height="8" fill={WALLS[color]} />
      <rect class="eave-shade" x={x - 6} y={y - 8} width="12" height="0.9" />
      <polygon
        class="roof"
        points={`${x - 7.5},${y - 8} ${x + 7.5},${y - 8} ${x},${y - 14}`}
        style={`fill: ${ROOFS[color]}`}
      />
      <path class="tiles" d={`M${x - 5.6},${y - 9.5}h11.2M${x - 3.1},${y - 11.5}h6.2`} />
      <Window x={x - 4.6} y={y - 6} shutter={shutter} />
      <Window x={x + 2.2} y={y - 6} shutter={shutter} />
      <path
        class="flowers"
        d={`M${x - 4.2},${y - 3.5}h0.01M${x - 3.4},${y - 3.6}h0.01M${x + 2.8},${y - 3.6}h0.01M${x + 3.8},${y - 3.5}h0.01`}
      />
      <rect class="door" x={x - 1.2} y={y - 4} width="2.4" height="4" rx="0.3" />
      <circle class="knob" cx={x + 0.6} cy={y - 2} r="0.25" />
      <rect class="step" x={x - 1.7} y={y - 0.5} width="3.4" height="0.5" />
    </g>
  );
}

/** The drop zone of a village: a target on the ground and a mailbox in its middle. */
function DropZone({ x0, x1, y }) {
  const cx = (x0 + x1) / 2;
  return (
    <g class="drop-zone">
      <ellipse class="ring outer" cx={cx} cy={y + 0.6} rx={(x1 - x0) / 2} ry="2.2" />
      <ellipse class="ring" cx={cx} cy={y + 0.6} rx={(x1 - x0) / 3} ry="1.5" />
      <ellipse class="ring outer" cx={cx} cy={y + 0.6} rx={(x1 - x0) / 6} ry="0.8" />
      <rect class="post" x={cx - 0.6} y={y - 8} width="1.2" height="8" />
      <rect class="mailbox" x={cx - 3} y={y - 11} width="6" height="3.6" rx="1.4" />
      <path class="flag" d={`M${cx + 2.4},${y - 11}v-5.5h4.5v2.6h-4.5`} />
    </g>
  );
}

/**
 * A hangar with an arched roof, its sliding doors half open on a plane inside,
 * and a lamp above the sign.
 */
function Hangar({ x, y }) {
  return (
    <g class="hangar-group">
      <path class="hangar" d={`M${x},${y}v-12q12,-9 24,0v12Z`} />
      <path
        class="siding"
        d={`M${x},${y - 3}h5M${x},${y - 6}h5M${x},${y - 9}h5M${x + 19},${y - 3}h5M${x + 19},${y - 6}h5M${x + 19},${y - 9}h5`}
      />
      <path class="roof-trim" d={`M${x - 0.6},${y - 11.6}q12.6,-9.6 25.2,0`} />
      <rect class="hangar-door" x={x + 5} y={y - 9} width="14" height="9" />
      {/* A plane waiting inside, seen from the front: wings, cowling and propeller. */}
      <path class="parked-wheels" d={`M${x + 11},${y - 2}l-1,2M${x + 13},${y - 2}l1,2`} />
      <rect class="parked" x={x + 9.6} y={y - 4.4} width="4.8" height="0.9" rx="0.4" />
      <circle class="parked" cx={x + 12} cy={y - 3.2} r="1.5" />
      <circle class="parked-hub" cx={x + 12} cy={y - 3.2} r="0.45" />
      <path class="parked-prop" d={`M${x + 12},${y - 5.6}v4.8`} />
      <path class="door-track" d={`M${x + 4.5},${y - 9.3}h15`} />
      <rect class="door-panel" x={x + 5} y={y - 9} width="4.5" height="9" />
      <rect class="door-panel" x={x + 14.5} y={y - 9} width="4.5" height="9" />
      <path
        class="brace"
        d={`M${x + 5},${y - 9}l4.5,9M${x + 9.5},${y - 9}l-4.5,9M${x + 14.5},${y - 9}l4.5,9M${x + 19},${y - 9}l-4.5,9`}
      />
      {/* A sign above the door, centered on the hangar and below its arched roof. */}
      <rect class="sign" x={x + 6} y={y - 12.6} width="12" height="3.2" rx="0.5" />
      <text class="sign-label" x={x + 12} y={y - 10.05}>
        MAIL
      </text>
      <path class="lamp" d={`M${x + 10.8},${y - 13.4}h2.4l-0.5,-1h-1.4Z`} />
      <circle class="lamp-light" cx={x + 12} cy={y - 13.2} r="0.5" />
    </g>
  );
}

/** A fuel tank: a cylinder on legs with a hatch on top and a pump with its hose. */
function FuelTank({ x, y }) {
  return (
    <g class="fuel-group">
      <path class="tank-leg" d={`M${x + 3},${y - 3}l-1,3M${x + 11},${y - 3}l1,3`} />
      <rect class="tank" x={x} y={y - 9.5} width="14" height="6.5" rx="3.2" />
      <path class="tank-shine" d={`M${x + 2.5},${y - 8.4}h9`} />
      <path class="tank-band" d={`M${x + 2.4},${y - 9.3}v6.1M${x + 11.6},${y - 9.3}v6.1`} />
      <rect class="hatch" x={x + 6} y={y - 10.6} width="2" height="1.1" rx="0.3" />
      <text class="tank-label" x={x + 7} y={y - 5.3}>
        FUEL
      </text>
      <rect class="pump" x={x + 15.5} y={y - 6} width="2.6" height="6" rx="0.4" />
      <rect class="pump-face" x={x + 16} y={y - 5.3} width="1.6" height="1.4" />
      <path
        class="hose"
        d={`M${x + 14},${y - 4.5}q1,0 1.5,0.5M${x + 18.1},${y - 4.8}q1.5,0 1.5,1.8v1.2`}
      />
      <rect class="nozzle" x={x + 19} y={y - 1.9} width="1" height="1.4" rx="0.3" />
    </g>
  );
}

/** An airstrip with a runway, a windsock, a hangar and a fuel tank. */
function Airstrip({ x0, x1, y }) {
  const dashes = [];
  for (let x = x0 + 14; x < x1 - 14; x += 14) {
    dashes.push(`M${x},${y + 1.4}h7`);
  }
  return (
    <g class="airstrip">
      <rect class="runway" x={x0} y={y - 0.5} width={x1 - x0} height="3.5" />
      <path class="dashes" d={dashes.join("")} />
      <path class="threshold" d={`M${x0 + 3},${y + 1.4}h6M${x1 - 9},${y + 1.4}h6`} />
      <line class="pole" x1={x0 - 10} y1={y} x2={x0 - 10} y2={y - 14} />
      {/* The windsock flutters from the top of its pole. */}
      <g class="windsock">
        <polygon
          class="sock"
          points={`${x0 - 10},${y - 14} ${x0 - 1},${y - 13} ${x0 - 1},${y - 11.5} ${x0 - 10},${y - 10.5}`}
        />
        <path class="sock-stripes" d={`M${x0 - 7},${y - 13.7}v3M${x0 - 4},${y - 13.4}v2.4`} />
      </g>
      <Hangar x={x1 + 6} y={y} />
      <FuelTank x={x1 + 33} y={y} />
    </g>
  );
}

/**
 * A sheep. It is rendered once on the server; CSS animations let it graze,
 * breathe and wander a few steps, without any work for the browser's frame loop.
 */
function Sheep({ x, y, flip, delay }) {
  return (
    <g class="sheep" transform={`translate(${round(x)} ${round(y)}) scale(${flip ? -1 : 1} 1)`}>
      <g class="wander" style={`--delay: -${delay}s`}>
        <path class="leg back" d="M-2,-1v1.6" />
        <path class="leg front" d="M2,-1v1.6" />
        <g class="body">
          <ellipse class="wool" cx="0" cy="-2.6" rx="3.6" ry="2.2" />
          <circle class="tuft" cx="-1.4" cy="-4.2" r="1.2" />
          <circle class="tuft" cx="1" cy="-4.4" r="1.3" />
        </g>
        <g class="head">
          <ellipse class="face" cx="3.4" cy="-3.4" rx="1.3" ry="1" />
          <ellipse class="ear" cx="2.8" cy="-4.3" rx="0.8" ry="0.35" />
        </g>
      </g>
    </g>
  );
}

/**
 * A boulder resting on the slope: its foot follows the ground on both sides and
 * sinks in a little, and a lit facet on top gives it some shape.
 */
function Boulder({ x, r, at }) {
  const ground = at(x);
  const left = Math.min(at(x - r), ground + r * 0.5) + 1;
  const right = Math.min(at(x + r), ground + r * 0.5) + 1;
  const top = ground - r * 0.9;
  const p = (dx, y) => `${round(x + dx)},${round(y)}`;
  return (
    <g class="boulder">
      <polygon
        class="stone"
        points={[
          p(-r, left),
          p(-r * 0.75, top + r * 0.45),
          p(-r * 0.2, top),
          p(r * 0.45, top + r * 0.15),
          p(r * 0.9, top + r * 0.6),
          p(r, right),
        ].join(" ")}
      />
      <polygon
        class="facet"
        points={[
          p(-r * 0.75, top + r * 0.45),
          p(-r * 0.2, top),
          p(r * 0.45, top + r * 0.15),
          p(0, top + r * 0.55),
        ].join(" ")}
      />
    </g>
  );
}

const SHIRTS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c"];
const HAIR = ["#422006", "#1c1917", "#ca8a04", "#9a3412"];

/**
 * A villager waving up at the plane. Rendered once on the server; CSS swings
 * the raised arm in bursts, each villager at their own --delay.
 */
function Villager({ x, y, child, shirt, hair, delay }) {
  return (
    <g
      class="villager"
      transform={`translate(${round(x)} ${round(y)}) scale(${child ? 0.72 : 1})`}
      style={`--delay: -${delay}s`}
    >
      <path class="legs" d="M-0.9,0v-3.2M0.9,0v-3.2" />
      <rect class="shirt" x="-1.6" y="-6.6" width="3.2" height="3.8" rx="1" fill={SHIRTS[shirt]} />
      <path class="arm" d="M-1.4,-6l-1,2.6" />
      <path class="arm waving" d="M1.4,-6.2l1.6,-2.8" />
      <circle class="head" cx="0" cy="-7.9" r="1.3" />
      <path class="hair" d="M-1.3,-8.1a1.3,1.3 0 0 1 2.6,0Z" fill={HAIR[hair]} />
    </g>
  );
}

/**
 * A fish that leaps out of the lake now and then, in an arc from one splash to
 * the next. Rendered once on the server; CSS animates the jump.
 */
function Fish({ x, flip, delay }) {
  return (
    <g
      class="leap"
      transform={`translate(${round(x)} ${WATER_Y}) scale(${flip ? -1 : 1} 1)`}
      style={`--delay: -${delay}s`}
    >
      <ellipse class="splash out" cx="-7" cy="0.5" rx="2" ry="0.6" />
      <ellipse class="splash in" cx="7" cy="0.5" rx="2" ry="0.6" />
      <g class="fish">
        <path class="tail" d="M-2.6,0L-4.4,-1.4V1.4Z" />
        <ellipse class="body" cx="0" cy="0" rx="2.8" ry="1.2" />
        <path class="fin" d="M-0.6,-1L0.4,-2L0.9,-1Z" />
        <circle class="eye" cx="1.7" cy="-0.3" r="0.3" />
      </g>
    </g>
  );
}

/**
 * One chunk of the course, rendered on the server. Its data attributes tell
 * the browser where the plane would crash, where to drop the mail and where to land.
 */
export default function Chunk({ seed, index }) {
  const c = buildChunk(seed, index);
  const step = SAMPLE / 2;
  const outline = c.ground.map((y, n) => `${n * step},${round(y)}`).join(" ");
  const at = (x) => c.ground[Math.min(c.ground.length - 1, Math.round(x / step))];
  const water = c.water.map((w) => {
    // Reeds grow at real shores, not where the water runs on into the next chunk.
    const reeds = [];
    if (w.x0 > 0) {
      reeds.push(`M${round(w.x0 + 2)},${WATER_Y}l-1,-6M${round(w.x0 + 4)},${WATER_Y}l1,-7`);
    }
    if (w.x1 < CHUNK) {
      reeds.push(`M${round(w.x1 - 3)},${WATER_Y}l1,-6`);
    }
    // Ripples in two rows, the lower one only where the water is deep enough.
    const depthAt = (x) => (w.bed.find(([bx]) => bx >= x)?.[1] ?? WATER_Y) - WATER_Y;
    const ripples = [];
    for (const [row, dy, shift] of [
      [0, 3, 0],
      [1, 7, 20],
    ]) {
      for (let x = Math.ceil((w.x0 + 6 - shift) / 40) * 40 + shift; x < w.x1 - 12; x += 40) {
        if (depthAt(x) > dy + 2 && depthAt(x + 8) > dy + 2) {
          ripples.push({ x, y: WATER_Y + dy, row });
        }
      }
    }
    return (
      <g class="lake">
        <polygon
          class="water"
          points={[[w.x0, WATER_Y], ...w.bed, [w.x1, WATER_Y]]
            .map(([x, y]) => `${round(x)},${round(y)}`)
            .join(" ")}
        />
        {ripples.map((r) => (
          <path
            class={`ripple row${r.row}`}
            d={`M${r.x},${r.y}h8`}
            style={`--delay: -${round(((index * CHUNK + r.x) / 37) % 3)}s`}
          />
        ))}
        <path class="reeds" d={reeds.join("")} />
        {w.fish && <Fish {...w.fish} />}
      </g>
    );
  });
  const offset = index * CHUNK;
  return (
    <g
      class={`chunk ${c.biome}`}
      transform={`translate(${offset} 0)`}
      data-index={index}
      data-solid={c.solid.join(" ")}
      data-drop={c.drop ? `${offset + c.drop.x0} ${offset + c.drop.x1}` : undefined}
      data-strip={c.strip ? `${offset + c.strip.x0} ${offset + c.strip.x1}` : undefined}
    >
      <polygon
        class="ground"
        points={`0,${HEIGHT} ${outline} ${CHUNK + 1},${round(c.ground.at(-1))} ${CHUNK + 1},${HEIGHT}`}
      />
      <polyline class="ridge" points={outline} />
      {water}
      {c.rocks.map((rock) => (
        <Boulder x={rock.x} r={rock.r} at={at} />
      ))}
      {c.strip && <Airstrip x0={c.strip.x0} x1={c.strip.x1} y={at(c.strip.x0 + 10)} />}
      {c.drop && <DropZone x0={c.drop.x0} x1={c.drop.x1} y={at(160)} />}
      {c.houses.map((house) => (
        <House {...house} />
      ))}
      {c.snow.map((flake) => (
        <circle
          class="flake"
          cx={round(flake.x)}
          cy="-4"
          r={round(flake.r)}
          style={`--fall: ${round(flake.fall)}px; --drift: ${round(flake.drift)}px; animation-duration: ${round(flake.duration)}s; animation-delay: -${round(flake.delay)}s`}
        />
      ))}
      {c.people.map((person) => (
        <Villager {...person} />
      ))}
      {c.sheep.map((sheep) => (
        <Sheep x={sheep.x} y={at(sheep.x)} flip={sheep.flip} delay={sheep.delay} />
      ))}
      {c.trees.map((tree) =>
        tree.kind === "pine" ? (
          <Pine x={round(tree.x)} y={tree.y} h={tree.h} wind={gust(offset + tree.x)} />
        ) : (
          <Oak x={round(tree.x)} y={tree.y} h={tree.h} wind={gust(offset + tree.x)} />
        ),
      )}
    </g>
  );
}
