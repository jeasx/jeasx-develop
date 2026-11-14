import {
  CEILING,
  CROCS,
  crocOpen,
  DEATH_TIME,
  FLOOR,
  GROUND,
  hash,
  HEIGHT,
  HOLE,
  LADDER_X,
  logX,
  POND,
  REACH,
  screenAt,
  shiftHalf,
  TREASURE_X,
  VINE,
  vineTip,
  WIDTH,
} from "./game";

const round = (n) => Math.round(n * 10) / 10;

/** Gradients shared by all frames, rendered once outside the animated screen. */
export function Defs() {
  return (
    <svg class="defs" width="0" height="0" aria-hidden="true">
      <defs>
        <linearGradient id="jr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#14532d" />
          <stop offset="0.6" stop-color="#3f6212" />
          <stop offset="1" stop-color="#65a30d" />
        </linearGradient>
        <linearGradient id="jr-trunk" x1="0" x2="1">
          <stop offset="0" stop-color="#3b1d0e" />
          <stop offset="0.4" stop-color="#7c4a21" />
          <stop offset="1" stop-color="#2a140a" />
        </linearGradient>
        <linearGradient id="jr-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#38bdf8" />
          <stop offset="1" stop-color="#0c4a6e" />
        </linearGradient>
        <linearGradient id="jr-tar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3f3f46" />
          <stop offset="1" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="jr-earth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#a16207" />
          <stop offset="1" stop-color="#713f12" />
        </linearGradient>
        <linearGradient id="jr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fef08a" />
          <stop offset="0.5" stop-color="#eab308" />
          <stop offset="1" stop-color="#a16207" />
        </linearGradient>
        <linearGradient id="jr-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e2e8f0" />
          <stop offset="0.45" stop-color="#94a3b8" />
          <stop offset="1" stop-color="#475569" />
        </linearGradient>
        <linearGradient id="jr-gold-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fde047" />
          <stop offset="0.5" stop-color="#ca8a04" />
          <stop offset="1" stop-color="#854d0e" />
        </linearGradient>
        <linearGradient id="jr-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fef9c3" stop-opacity="0.55" />
          <stop offset="1" stop-color="#fef9c3" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="jr-glow-cool">
          <stop offset="0" stop-color="#f0f9ff" stop-opacity="0.9" />
          <stop offset="0.35" stop-color="#7dd3fc" stop-opacity="0.4" />
          <stop offset="1" stop-color="#38bdf8" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="jr-glow">
          <stop offset="0" stop-color="#fef9c3" stop-opacity="0.9" />
          <stop offset="0.35" stop-color="#facc15" stop-opacity="0.45" />
          <stop offset="1" stop-color="#facc15" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="jr-light" cx="50%" cy="0%" r="100%">
          <stop offset="0" stop-color="#fef9c3" stop-opacity="0.35" />
          <stop offset="1" stop-color="#fef9c3" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * The wind at a place and time, roughly from -1 to 1: a slow breeze with gusts
 * that roll across the screen from left to right.
 */
function wind(x, clock) {
  return 0.6 * Math.sin(clock * 0.7) + 0.4 * Math.sin(clock * 1.9 - x * 0.04);
}

/** Distant trees and a wall of foliage behind the scene, different on every screen. */
function Backdrop({ index, clock }) {
  const far = [];
  for (let i = 0; i < 9; i++) {
    const x = round(hash(index, 20 + i) * WIDTH);
    far.push(
      <rect
        class="far-trunk"
        x={x}
        y="10"
        width={round(3 + hash(index, 40 + i) * 4)}
        height={GROUND - 10}
      />,
    );
  }
  let bush = `M0,${GROUND}`;
  for (let x = 0; x <= WIDTH; x += 20) {
    const top = GROUND - 14 - hash(index * 31 + x, 5) * 16;
    const sway = wind(x, clock) * 2;
    bush += `Q${round(x + 10 + sway)},${round(top - 8 + Math.abs(sway) * 0.5)} ${x + 20},${round(top + 4)}`;
  }
  bush += `L${WIDTH},${GROUND}Z`;
  return (
    <>
      <rect class="sky" width={WIDTH} height={GROUND} />
      {far}
      <path class="bush" d={bush} />
      {/* Light falls through the moving leaves, so the rays flicker. */}
      <polygon
        class="rays"
        points={`70,0 120,0 190,${GROUND} 110,${GROUND}`}
        opacity={round(0.75 + 0.25 * Math.sin(clock * 1.3))}
      />
      <polygon
        class="rays"
        points={`210,0 235,0 290,${GROUND} 250,${GROUND}`}
        opacity={round(0.7 + 0.3 * Math.sin(clock * 1.7 + 2))}
      />
    </>
  );
}

/** Four big trees with roots and bark, and a canopy of layered leaves overhead. */
function Trees({ index, clock }) {
  const trunks = [];
  for (let i = 0; i < 4; i++) {
    const x = round(20 + i * 80 + (hash(index, 60 + i) - 0.5) * 30);
    const w = round(9 + hash(index, 70 + i) * 5);
    // Trunks stand firm at the roots and sway a little at the top.
    const sway = round(wind(x, clock) * 1.5);
    const bark = [];
    for (let y = 34 + i * 3; y < GROUND - 6; y += 11) {
      bark.push(`M${round(x + 2)},${y}q${round(w / 3)},3 ${round(w / 2)},0`);
    }
    trunks.push(
      <g class="tree">
        <path
          class="trunk"
          d={`M${x},${GROUND}L${round(x + 1.5 + sway)},18L${round(x + w - 1.5 + sway)},18L${round(x + w)},${GROUND}Z`}
        />
        <path class="bark" d={bark.join("")} />
        <path
          class="root"
          d={`M${round(x - 6)},${GROUND}Q${round(x)},${GROUND - 4} ${round(x + 2)},${GROUND - 10}L${round(x + w - 2)},${GROUND - 10}Q${round(x + w)},${GROUND - 4} ${round(x + w + 6)},${GROUND}Z`}
        />
      </g>,
    );
  }
  const leaves = [];
  // The upper, lighter leaves move most in the wind.
  for (const { layer, top, size, sway } of [
    { layer: "dark", top: 18, size: 20, sway: 1.2 },
    { layer: "mid", top: 10, size: 17, sway: 2 },
    { layer: "light", top: 2, size: 13, sway: 3 },
  ]) {
    for (let x = -10; x < WIDTH + 20; x += size * 1.1) {
      const r = hash(index * 7 + Math.round(x), top);
      const gust = wind(x, clock + r);
      leaves.push(
        <ellipse
          class={`leaf ${layer}`}
          cx={round(x + gust * sway)}
          cy={round(top + r * 10 + Math.abs(gust) * sway * 0.3)}
          rx={round(size * (0.9 + r * 0.4))}
          ry={round(size * 0.65)}
        />,
      );
    }
  }
  return (
    <>
      {trunks}
      {leaves}
      <FallingLeaves index={index} clock={clock} />
    </>
  );
}

const LEAF_COLORS = ["green", "lime", "yellow", "orange", "red"];

/** A few leaves drift down from the canopy, tumbling and swaying on the wind. */
function FallingLeaves({ index, clock }) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = (clock * 0.09 + i / 3 + hash(index, 200 + i)) % 1;
        const fall = Math.floor(clock * 0.09 + i / 3 + hash(index, 200 + i));
        const x = round(hash(fall, i + 300) * WIDTH + Math.sin(t * 14) * 8 + t * 20);
        const y = round(20 + t * (GROUND - 22));
        const angle = round(Math.sin(t * 14) * 50);
        // Every leaf that falls picks its own color, from fresh green to autumn red.
        const color = LEAF_COLORS[Math.floor(hash(fall, i + 400) * LEAF_COLORS.length)];
        return (
          <ellipse
            class={`falling-leaf ${color}`}
            cx={x}
            cy={y}
            rx="3.6"
            ry="1.6"
            transform={`rotate(${angle} ${x} ${y})`}
            opacity={round(Math.min(1, (1 - t) * 6))}
          />
        );
      })}
    </>
  );
}

/** The jungle floor, the earth below it and the brick tunnel underneath. */
function Ground({ index, screen, clock }) {
  // Blades of grass bend with the wind; taller tufts bend more.
  const tufts = [];
  for (let x = 4; x < WIDTH; x += 9 + Math.round(hash(index, x) * 8)) {
    const tall = 1 + hash(x, index) * 0.6;
    const bend = round(wind(x, clock) * 1.6 * tall);
    const h1 = round(4 * tall);
    const h2 = round(5 * tall);
    tufts.push(
      `M${x},${GROUND + 1}l${round(2 + bend)},-${h1}l${round(1 - bend)},${h1}l${round(2 + bend)},-${h2}l${round(1 - bend)},${h2}`,
    );
  }
  const pebbles = [];
  for (let i = 0; i < 18; i++) {
    pebbles.push(
      <ellipse
        class="pebble"
        cx={round(hash(index, 100 + i) * WIDTH)}
        cy={round(GROUND + 7 + hash(index, 120 + i) * 12)}
        rx="2"
        ry="1.2"
      />,
    );
  }
  const bricks = [];
  for (let y = CEILING + 8, row = 0; y < FLOOR; y += 8, row++) {
    bricks.push(`M0,${y}H${WIDTH}`);
    for (let x = row % 2 ? 10 : 0; x < WIDTH; x += 20) {
      bricks.push(`M${x},${y - 8}v8`);
    }
  }
  const floorBricks = [];
  for (let y = FLOOR + 5; y < HEIGHT; y += 6) {
    floorBricks.push(`M0,${y}H${WIDTH}`);
  }
  return (
    <>
      <rect class="earth" y={GROUND} width={WIDTH} height={CEILING - GROUND} />
      {pebbles}
      <rect class="grass" y={GROUND - 1} width={WIDTH} height="4" />
      <path class="tufts" d={tufts.join("")} />
      <rect class="tunnel" y={CEILING} width={WIDTH} height={FLOOR - CEILING} />
      <path class="bricks" d={bricks.join("")} />
      <rect class="floor" y={FLOOR} width={WIDTH} height={HEIGHT - FLOOR} />
      <path class="floor-lines" d={floorBricks.join("")} />
      {screen.wall !== null && <Wall x={screen.wall} />}
    </>
  );
}

function Wall({ x }) {
  const lines = [];
  for (let y = CEILING + 6, row = 0; y < FLOOR; y += 6, row++) {
    lines.push(`M${x - 6},${y}h12`);
    lines.push(`M${x + (row % 2 ? -2 : 3)},${y - 6}v6`);
  }
  return (
    <g class="wall">
      <rect x={x - 6} y={CEILING} width="12" height={FLOOR - CEILING} />
      <path d={lines.join("")} />
    </g>
  );
}

/** A hole in the jungle floor with a ladder down into the tunnel. */
function Hole() {
  const rungs = [];
  for (let y = GROUND + 6; y < FLOOR; y += 7) {
    rungs.push(`M${LADDER_X - 5},${y}h10`);
  }
  return (
    <g class="hole">
      <rect
        class="shaft"
        x={HOLE.from}
        y={GROUND - 1}
        width={HOLE.to - HOLE.from}
        height={CEILING - GROUND + 1}
      />
      <path
        class="rails"
        d={`M${LADDER_X - 5},${GROUND}V${FLOOR}M${LADDER_X + 5},${GROUND}V${FLOOR}`}
      />
      <path class="rungs" d={rungs.join("")} />
    </g>
  );
}

/** Water or tar from x0 to x1, with ripples or bubbles that move with the clock. */
function Pool({ kind, x0, x1, clock }) {
  if (x1 - x0 < 1) {
    return null;
  }
  const width = round(x1 - x0);
  const ripples = [];
  if (kind === "water") {
    // Ripples drift along and wrap around, keeping clear of the banks.
    const span = width - 12;
    for (let i = 0; i < span / 14; i++) {
      const x = round(x0 + 3 + ((i * 14 + clock * 12) % span));
      ripples.push(`M${x},${GROUND + 4 + (i % 3) * 3}h6`);
    }
  }
  const bubbles = [];
  if (kind === "tar") {
    for (let i = 0; i < 4; i++) {
      const t = (clock * 0.7 + i * 0.27) % 1;
      const x = round(x0 + width * hash(i, Math.floor(clock * 0.7 + i * 0.27)));
      bubbles.push(
        <circle
          class="bubble"
          cx={x}
          cy={GROUND + 3}
          r={round(1 + t * 2.5)}
          opacity={round(1 - t)}
        />,
      );
    }
  }
  return (
    <g class={`pool ${kind}`}>
      <path
        class="liquid"
        d={`M${round(x0)},${GROUND + 1}H${round(x1)}V${GROUND + 12}Q${round(x1)},${GROUND + 18} ${round(x1 - 8)},${GROUND + 18}H${round(x0 + 8)}Q${round(x0)},${GROUND + 18} ${round(x0)},${GROUND + 12}Z`}
      />
      <rect
        class="shine"
        x={round(x0 + 4)}
        y={GROUND + 2}
        width={round(Math.max(0, width - 8))}
        height="1.5"
      />
      <path class="ripples" d={ripples.join("")} />
      {bubbles}
    </g>
  );
}

/** Zigzag teeth along a jaw from x0 to x1 at y, pointing down (1) or up (-1). */
function teeth(x0, x1, y, dir) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < x1; x += 2) {
    d += `l1,${1.9 * dir}l1,${-1.9 * dir}`;
  }
  return d;
}

/**
 * A crocodile lurking in the water, facing left: a ridged snout full of teeth,
 * a slit-eyed stare and a spiked back. When its jaws open, the eye glows.
 */
function Croc({ x, open, clock }) {
  const g = GROUND;
  const bob = round(Math.sin(clock * 2 + x) * 0.6);
  const angle = open ? 38 : 0;
  return (
    <g class={`croc ${open ? "open" : ""}`} transform={`translate(0 ${bob})`}>
      <ellipse class="ripple" cx={x + 4} cy={g + 2.5} rx="18" ry="2" />
      <ellipse class="body" cx={x + 12} cy={g + 4} rx="12" ry="3.5" />
      <path
        class="spikes"
        d={`M${x + 6},${g + 2.5}l1.5,-3l1.5,3l1.5,-3.8l1.5,3.8l1.5,-3.4l1.5,3.4l1.5,-3l1.5,3l1.5,-2.4l1.5,2.4Z`}
      />
      {open && (
        <path class="mouth" d={`M${x + 7},${g + 1}L${x - 10},${g + 2.4}L${x - 7},${g - 10}Z`} />
      )}
      {open && <path class="tongue" d={`M${x + 5},${g + 2}Q${x - 2},${g} ${x - 5},${g + 2}Z`} />}
      <path class="teeth low" d={teeth(x - 10, x + 4, g + 2.4, -1)} />
      <path
        class="jaw low"
        d={`M${x + 8},${g + 2}L${x - 11},${g + 2.2}Q${x - 12},${g + 3.4} ${x - 10},${g + 4}L${x + 8},${g + 4.8}Z`}
      />
      <g transform={`rotate(${angle} ${x + 7} ${g + 1})`}>
        <path class="teeth top" d={teeth(x - 10, x + 4, g + 1.8, 1)} />
        <path class="fang" d={`M${x - 9.6},${g + 1.8}l0.7,3.2l0.9,-3.2Z`} />
        <path
          class="jaw top"
          d={`M${x + 10},${g + 2}L${x - 11},${g + 2}Q${x - 13},${g - 0.6} ${x - 9.5},${g - 1.4}L${x - 4},${g - 1.6}Q${x - 3},${g - 2.8} ${x - 2},${g - 1.8}L${x + 2},${g - 2.6}Q${x + 5},${g - 6.4} ${x + 10},${g - 4}Z`}
        />
        <path
          class="scales"
          d={`M${x - 6},${g}h0.01M${x - 3.5},${g - 0.4}h0.01M${x - 1},${g - 0.6}h0.01M${x + 1},${g}h0.01M${x - 5},${g + 1}h0.01M${x - 2},${g + 0.8}h0.01`}
        />
        <circle class="nostril" cx={x - 9.4} cy={g - 1} r="0.55" />
        <path class="brow" d={`M${x + 2.6},${g - 4.4}Q${x + 5},${g - 7.4} ${x + 7.6},${g - 5}`} />
        <ellipse class="eye" cx={x + 5} cy={g - 4.6} rx="1.9" ry="1.3" />
        <ellipse class="pupil" cx={x + 4.8} cy={g - 4.6} rx="0.35" ry="1.2" />
      </g>
    </g>
  );
}

/** A vine hanging from the canopy, swinging with the clock. */
function Vine({ clock }) {
  const tip = vineTip(clock);
  const mx = round((VINE.x + tip.x) / 2 + (tip.x - VINE.x) * -0.15);
  const my = round((VINE.y + tip.y) / 2);
  const leaves = [0.3, 0.55, 0.8].map((t) => {
    const x = round(VINE.x + (tip.x - VINE.x) * t);
    const y = round(VINE.y + (tip.y - VINE.y) * t);
    return (
      <ellipse
        class="vine-leaf"
        cx={x + 2}
        cy={y}
        rx="3"
        ry="1.4"
        transform={`rotate(-30 ${x} ${y})`}
      />
    );
  });
  return (
    <g class="vine">
      <path d={`M${VINE.x},${VINE.y}Q${mx},${my} ${round(tip.x)},${round(tip.y)}`} />
      {leaves}
    </g>
  );
}

/** A log rolling along the floor; its end shows rings that turn as it rolls. */
function Log({ x, clock, speed }) {
  const angle = round((-clock * speed * 180) / (Math.PI * 6));
  const cx = round(x);
  return (
    <g class="log" transform={`rotate(${angle} ${cx} ${GROUND - 6})`}>
      <circle class="bark" cx={cx} cy={GROUND - 6} r="6.5" />
      <circle class="wood" cx={cx} cy={GROUND - 6} r="4.6" />
      <circle class="ring" cx={cx} cy={GROUND - 6} r="2.6" />
      <path class="crack" d={`M${cx},${GROUND - 6}L${cx + 4},${GROUND - 8}`} />
    </g>
  );
}

/** One bar of gold or silver: a front face, a lighter top, a stamp and maybe a glint. */
function Ingot({ x, y, glint = -1 }) {
  const w = 5.5;
  const top = y - 4;
  const shine = glint >= 0 && glint < 0.4 ? x - w + 2 + (glint / 0.4) * (w * 2 - 4) : null;
  return (
    <g class="ingot">
      <path class="face" d={`M${x - w},${y}H${x + w}L${x + w - 1.6},${top}H${x - w + 1.6}Z`} />
      <path
        class="lid"
        d={`M${x - w + 1.6},${top}H${x + w - 1.6}L${x + w - 3},${top - 2}H${x - w + 3}Z`}
      />
      <rect class="stamp" x={x - 2} y={top + 1.2} width="4" height="1.8" rx="0.3" />
      {shine !== null && <path class="glint" d={`M${round(shine)},${y - 0.4}l1.6,${-3.4}`} />}
    </g>
  );
}

/** A treasure waiting on the jungle floor, glowing with a slow pulse. */
function Treasure({ kind, clock }) {
  const x = TREASURE_X;
  const y = GROUND;
  const pulse = (Math.sin(clock * 3) + 1) / 2;
  return (
    <g class={`treasure ${kind}`}>
      <ellipse
        class={kind === "silver" ? "glow cool" : "glow"}
        cx={x}
        cy={y - 6}
        rx={round(13 + pulse * 4)}
        ry={round(11 + pulse * 3)}
        opacity={round(0.55 + pulse * 0.45)}
      />
      {(kind === "gold" || kind === "silver") && (
        <>
          <Ingot x={x - 6} y={y} />
          <Ingot x={x + 6} y={y} />
          <Ingot x={x} y={y - 6} glint={(clock * 0.6) % 1} />
        </>
      )}
      {kind === "ring" && (
        <>
          <circle class="band" cx={x} cy={y - 5} r="4.5" />
          <path
            class="gem"
            d={`M${x - 3},${y - 10}L${x},${y - 14}L${x + 3},${y - 10}L${x},${y - 8}Z`}
          />
        </>
      )}
      {kind === "money" && (
        <>
          <path
            class="bag"
            d={`M${x - 3},${y - 10}Q${x - 9},${y - 4} ${x - 7},${y}H${x + 7}Q${x + 9},${y - 4} ${x + 3},${y - 10}Z`}
          />
          <path
            class="tie"
            d={`M${x - 4},${y - 10}H${x + 4}M${x - 2},${y - 12}L${x},${y - 10}L${x + 2},${y - 12}`}
          />
          <text x={x} y={y - 2}>
            $
          </text>
        </>
      )}
    </g>
  );
}

/** A scorpion in the tunnel, its tail curled over its back. */
function Scorpion({ x, facing, clock }) {
  const legs = Math.floor(clock * 8) % 2 ? 1 : -1;
  return (
    <g class="scorpion" transform={`translate(${round(x)} ${FLOOR}) scale(${facing} 1)`}>
      <path class="legs" d={`M-5,-2l-2,2M-2,-2l${legs},2M1,-2l${-legs},2M4,-2l2,2`} />
      <ellipse class="body" cx="0" cy="-3.5" rx="6" ry="2.5" />
      <path class="tail" d="M-5,-4Q-11,-6 -9,-12Q-6,-15 -2,-12" />
      <path class="sting" d="M-2,-12l2,1l-1,1.5" />
      <path class="claw" d="M5,-4q4,-2 5,1q-2,0 -3,-1M5,-3q4,1 4,3" />
      <circle class="eye" cx="4" cy="-4.5" r="0.7" />
    </g>
  );
}

/** One limb from a joint, as two segments with a bend. */
function limb(x, y, angle, bend, length) {
  const kx = x + Math.sin(angle) * length;
  const ky = y + Math.cos(angle) * length;
  const fx = kx + Math.sin(angle - bend) * length;
  const fy = ky + Math.cos(angle - bend) * length;
  return `M${round(x)},${round(y)}L${round(kx)},${round(ky)}L${round(fx)},${round(fy)}`;
}

/** The last point of a limb path, where the hand or the foot is. */
function end(d) {
  const [, x, y] = d.match(/(-?[\d.]+),(-?[\d.]+)$/);
  return [Number(x), Number(y)];
}

function Hand({ d, back = false }) {
  const [x, y] = end(d);
  return <circle class={back ? "hand back" : "hand"} cx={x} cy={y} r="1" />;
}

function Boot({ d, back = false }) {
  const [x, y] = end(d);
  return (
    <path
      class={back ? "boot back" : "boot"}
      d={`M${round(x - 1.2)},${round(y - 1.6)}h2v1.2h1.4v0.9h-3.4Z`}
    />
  );
}

/** The explorer, drawn from limbs whose angles depend on what they are doing. */
function Explorer({ state }) {
  const { x, y, facing, walk } = state;
  const phase = walk * 0.35;
  let legs;
  let arms;
  if (state.vine) {
    legs = [limb(0, -10, 0.25, 0.4, 5), limb(0, -10, 0.05, 0.2, 5)];
    arms = [`M0,-16L1,${-REACH}`, `M0,-16L-1,${-REACH}`];
  } else if (state.climbing) {
    const s = Math.sin(phase);
    legs = [limb(-1.5, -10, 0, s > 0 ? 1 : 0, 5), limb(1.5, -10, 0, s > 0 ? 0 : 1, 5)];
    arms = [`M-1,-16L-4,${round(-22 + s * 2)}`, `M1,-16L4,${round(-22 - s * 2)}`];
  } else if (!state.ground) {
    legs = [limb(0, -10, 0.9, 1.6, 5), limb(0, -10, -0.4, -0.2, 5)];
    arms = [limb(0, -16, 2.4, -0.4, 4), limb(0, -16, -2.2, 0.3, 4)];
  } else if (state.vx !== 0) {
    const s = Math.sin(phase);
    legs = [
      limb(0, -10, s * 0.7, s > 0 ? 0.9 : 0.1, 5),
      limb(0, -10, -s * 0.7, s < 0 ? 0.9 : 0.1, 5),
    ];
    arms = [limb(0, -16, -s * 0.8, -0.6, 4), limb(0, -16, s * 0.8, -0.6, 4)];
  } else {
    legs = [limb(-1, -10, 0.08, 0, 5), limb(1, -10, -0.08, 0, 5)];
    arms = [limb(0, -16, 0.2, -0.3, 4), limb(0, -16, -0.15, -0.2, 4)];
  }
  // After a death, the body fades away while the ghost appears; a crocodile swallows it at once.
  const dying = state.dead > 0;
  const fade = dying ? Math.max(0, 1 - (1 - state.dead / DEATH_TIME) / 0.2) : 1;
  if (fade <= 0 || (dying && state.cause === "croc")) {
    return null;
  }
  return (
    <g
      class="explorer"
      transform={`translate(${round(x)} ${round(y)}) scale(${facing} 1)`}
      opacity={fade < 1 ? round(fade) : undefined}
    >
      <path class="arm back" d={arms[1]} />
      <Hand d={arms[1]} back />
      <path class="leg back" d={legs[1]} />
      <Boot d={legs[1]} back />
      <path class="leg" d={legs[0]} />
      <Boot d={legs[0]} />
      {/* The satchel hangs at the hip on a strap across the chest. */}
      <rect class="satchel" x="-5.4" y="-12.6" width="3.6" height="3.4" rx="0.8" />
      <rect class="shirt" x="-3.2" y="-17.5" width="6.4" height="8" rx="1.5" />
      <path
        class="jacket"
        d="M-3.4,-17.4h2.6l-0.4,7.6h-2.4q-0.4,-4 0.2,-7.6ZM3.4,-17.4h-1.4l0.6,7.6h1.2q0.4,-4 -0.4,-7.6Z"
      />
      <path class="collar" d="M-1,-17.6l1.2,1.8l1.4,-1.8" />
      <path class="strap" d="M2.6,-17.2L-3.6,-11.6" />
      <path class="belt" d="M-3.2,-10.2h6.4" />
      <circle class="whip" cx="2.6" cy="-9.4" r="1.6" />
      <circle class="head" cx="0.4" cy="-20.2" r="2.8" />
      <path class="stubble" d="M-1.4,-18.6q1.8,1.6 4,-0.4" />
      <circle class="eye" cx="2" cy="-20.6" r="0.5" />
      <ellipse class="brim" cx="0.4" cy="-21.9" rx="5.2" ry="0.9" />
      <path class="crown" d="M-2.5,-21.9l0.4,-2.8q1.4,-0.9 2.5,-0.2q1.1,-0.7 2.6,0.2l0.4,2.8Z" />
      <path class="band" d="M-2.4,-22.5h5.7" />
      <path class="arm" d={arms[0]} />
      <Hand d={arms[0]} />
    </g>
  );
}

/**
 * After a death, the explorer's ghost floats up to the heavens: it sways
 * on the way, wears a halo and fades away in a beam of light from above.
 */
function Ghost({ state }) {
  const p = 1 - state.dead / DEATH_TIME;
  const fade = Math.min(1, p * 5) * Math.min(1, (1 - p) * 4);
  const x = round(state.ghostX + Math.sin(p * 12) * 5);
  const y = round(state.ghostY - 12 - p * p * 110);
  const tilt = round(Math.cos(p * 12) * 8);
  // The hem flutters: four little waves from right to left.
  const hem = Array.from({ length: 4 }, (_, i) => {
    const wave = Math.sin(state.clock * 14 + i * 1.8) * 1.2;
    return `q-1,${round(3 + wave)} -2,0`;
  }).join("");
  return (
    <g class="ghost" opacity={round(fade)}>
      <polygon
        class="beam"
        points={`${round(state.ghostX - 6)},0 ${round(state.ghostX + 6)},0 ${round(state.ghostX + 22)},${round(state.ghostY)} ${round(state.ghostX - 22)},${round(state.ghostY)}`}
        opacity={round(0.8 - p * 0.5)}
      />
      <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(1.5)`}>
        <path class="sheet" d={`M-4,6V-3a4,4 0 0 1 8,0V6${hem}Z`} />
        <ellipse class="eye" cx="-1.6" cy="-2.6" rx="0.8" ry="1.2" />
        <ellipse class="eye" cx="1.6" cy="-2.6" rx="0.8" ry="1.2" />
        <ellipse class="mouth" cx="0" cy="0.4" rx="0.8" ry="1" />
        <path class="arms" d="M-4,0q-3,-1 -4,-4M4,0q3,-1 4,-4" />
        <ellipse class="halo" cx="0" cy="-8.6" rx="3.6" ry="1" />
      </g>
    </g>
  );
}

/** The whole scene for one frame. */
export default function Scene({ state }) {
  const index = state.screen;
  const screen = screenAt(index);
  const { clock } = state;
  const pond =
    screen.hazard === "pit" || screen.hazard === "croc"
      ? { kind: screen.hazard === "croc" ? "water" : screen.pit, x0: POND.from, x1: POND.to }
      : screen.hazard === "shift"
        ? { kind: "tar", x0: LADDER_X - shiftHalf(clock), x1: LADDER_X + shiftHalf(clock) }
        : null;
  return (
    <svg class="scene" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice">
      <Backdrop index={index} clock={clock} />
      <Trees index={index} clock={clock} />
      <Ground index={index} screen={screen} clock={clock} />
      {screen.hazard === "hole" && <Hole />}
      {screen.vine && <Vine clock={clock} />}
      {screen.treasure && !state.collected.includes(index) && (
        <Treasure kind={screen.treasure} clock={clock} />
      )}
      {screen.wall === null && (
        <Scorpion x={state.scorpion} facing={state.x > state.scorpion ? 1 : -1} clock={clock} />
      )}
      {state.status !== "over" && <Explorer state={state} />}
      {pond && <Pool {...pond} clock={clock} />}
      {screen.hazard === "croc" &&
        CROCS.map((x) => <Croc x={x} open={crocOpen(clock)} clock={clock} />)}
      {screen.logs.map((log) => (
        <Log x={logX(log, clock)} clock={clock} speed={log.speed} />
      ))}
      {state.dead > 0 && <Ghost state={state} />}
    </svg>
  );
}
