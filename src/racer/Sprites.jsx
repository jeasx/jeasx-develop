const SHIRTS = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#f97316", "#a855f7", "#f8fafc"];
const SKIN = ["#f5d0a9", "#d4a373", "#8d5524", "#e0ac69"];

/** Two rows of spectators standing behind a barrier, with their arms down or thrown up. */
function Crowd({ id, cheer }) {
  const people = [];
  for (let row = 0; row < 2; row++) {
    for (let n = 0; n < 9; n++) {
      const i = row * 9 + n;
      const x = 12 + n * 22 + (row ? 11 : 0);
      const y = row ? 52 : 34;
      const shirt = SHIRTS[(i * 5) % SHIRTS.length];
      // Not everybody cheers at once.
      const up = cheer && i % 3 !== 1;
      people.push(
        <g>
          <path
            d={
              up
                ? `M${x - 6} ${y + 4} l-5 -14 M${x + 6} ${y + 4} l5 -14`
                : `M${x - 6} ${y + 4} l-3 12 M${x + 6} ${y + 4} l3 12`
            }
            stroke={SKIN[i % SKIN.length]}
            stroke-width="3"
            stroke-linecap="round"
          />
          <rect x={x - 7} y={y} width="14" height="20" rx="4" fill={shirt} />
          <circle cx={x} cy={y - 6} r="6" fill={SKIN[i % SKIN.length]} />
        </g>,
      );
    }
  }
  return (
    <symbol id={id} viewBox="0 0 220 100">
      {people}
      <rect x="0" y="76" width="220" height="24" fill="#f8fafc" />
      <rect x="0" y="76" width="220" height="6" fill="#dc2626" />
    </symbol>
  );
}

const HIDE = "#f4efe6";
const PATCH = "#26211d";
const OUTLINE = "#3b342e";

/**
 * One leg from the hip or shoulder down to the hoof, outlined by drawing it
 * twice. `dx` swings the hoof forwards or backwards for the walk.
 */
function Leg({ x, dx, far = false }) {
  const d = `M${x} 30 Q${x + dx * 0.3} 46 ${x + dx} 55`;
  return (
    <>
      <path d={d} stroke={OUTLINE} stroke-width="5.6" stroke-linecap="round" />
      <path d={d} stroke={far ? "#d8d0c3" : HIDE} stroke-width="4.2" stroke-linecap="round" />
      <path d={`M${x + dx} 54.5 L${x + dx} 58.5`} stroke="#1c1815" stroke-width="5" />
    </>
  );
}

/**
 * A Holstein cow seen from the side, walking to the right. `step` puts the
 * legs into one of two walking poses: diagonal pairs of legs swing together.
 * The top of the head sits at 82 × 6, where the moo bubble points to.
 */
function Cow({ id, step }) {
  const s = step * 4;
  // Hip bones and shoulders stand out a little; the back dips in between.
  const body =
    "M12 18 Q12 11 19 10 Q25 8 31 10 Q43 12 54 9 Q64 7 69 14 L70 30 Q68 39 58 40 L24 40 Q13 41 11 32 Z";
  return (
    <symbol id={id} viewBox="0 0 96 60">
      <clipPath id={`${id}-body`}>
        <path d={body} />
      </clipPath>
      <g fill="none">
        {/* The tail hangs from the rump and swings a little with the walk. */}
        <path
          d={`M12 15 Q${8 - step} 26 ${9 - step * 2} 36`}
          stroke={OUTLINE}
          stroke-width="1.4"
          stroke-linecap="round"
        />
        {/* Legs first, so the body covers their tops; far legs are a shade darker. */}
        <Leg x={22} dx={s} far />
        <Leg x={61} dx={-s} far />
        <Leg x={27} dx={-s} />
        <Leg x={65} dx={s} />
      </g>
      {/* Short horns and an ear behind the head. */}
      <path
        d="M79 7 Q78.5 3 81 2 M84.5 7 Q86.5 3.5 89 4"
        fill="none"
        stroke="#d9cba8"
        stroke-width="1.6"
        stroke-linecap="round"
      />
      <path
        d="M79 10 Q72 6 68.5 8.5 Q71.5 12.5 79 12.5 Z"
        fill={PATCH}
        stroke={OUTLINE}
        stroke-width="0.5"
      />
      {/* Neck and a long head in one outline; the body covers the base of the neck. */}
      <path
        d="M58 10 Q69 6 77 7.5 Q83 5 87 8 Q90 11 91 16 L94 24 Q95 30 89 30 L84 30 Q80 28 78 23 Q72 29 63 30 Z"
        fill={HIDE}
        stroke={OUTLINE}
        stroke-width="0.8"
        stroke-linejoin="round"
      />
      <path d="M77.5 7.5 Q83 5 87 8 Q86.5 13 82.5 17 Q78.5 14 77.5 7.5 Z" fill={PATCH} />
      <ellipse cx="89.5" cy="26.5" rx="4.4" ry="3.6" fill="#c9a196" />
      <ellipse cx="91.5" cy="25.5" rx="0.9" ry="0.7" fill="#5b3f37" />
      <ellipse cx="83" cy="14" rx="1.2" ry="1" fill="#f4efe6" />
      <circle cx="83.2" cy="14" r="0.8" fill="#120f0d" />
      <ellipse cx={9 - step * 2} cy="38" rx="1.8" ry="3.2" fill={PATCH} />
      <path d={body} fill={HIDE} stroke={OUTLINE} stroke-width="0.8" />
      {/* Irregular patches, cut to the outline of the body, and a shaded belly. */}
      <g clip-path={`url(#${id}-body)`}>
        <path
          d="M17 6 L27 7 Q33 11 31 16 L34 21 Q30 27 24 25 L19 27 Q14 23 15 18 L10 14 Z M41 6 L52 7 Q58 9 57 14 L60 19 Q57 25 51 24 Q47 28 43 24 L44 18 Q38 14 41 6 Z M31 33 Q36 29 41 32 L47 31 Q50 38 46 42 L32 42 Q28 38 31 33 Z"
          fill={PATCH}
        />
        <rect x="0" y="33" width="80" height="10" fill="#000" opacity="0.1" />
      </g>
      {/* Udder between the hind legs. */}
      <path
        d="M30 39 Q31 44.5 35 44.5 Q39 44.5 40 39 Z"
        fill="#e3b2a6"
        stroke={OUTLINE}
        stroke-width="0.6"
      />
      <path
        d="M33 44 L33 46.5 M37 44 L37 46.5"
        stroke="#c98f84"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </symbol>
  );
}

/** Messages along the track, all about Jeasx. Each billboard shows one of them. */
export const BILLBOARDS = [
  { title: "JEASX", paint: "#facc15", ink: "#0f172a" },
  { title: "ASYNC JSX", paint: "#38bdf8", ink: "#0f172a" },
  { title: "FASTIFY", paint: "#0f172a", ink: "#f8fafc" },
  { title: "ESBUILD", paint: "#fbbf24", ink: "#7c2d12" },
  { title: "STREAMING", paint: "#22c55e", ink: "#052e16" },
  { title: "ISOMORPHIC", paint: "#f8fafc", ink: "#dc2626" },
];

/**
 * A billboard on two posts. The title is squeezed or stretched to fill the
 * panel, so short and long ones look equally bold.
 */
function Billboard({ id, title, paint, ink }) {
  return (
    <symbol id={id} viewBox="0 0 150 110">
      <rect x="20" y="50" width="8" height="60" fill="#475569" />
      <rect x="122" y="50" width="8" height="60" fill="#475569" />
      <rect x="0" y="0" width="150" height="66" rx="4" fill="#0f172a" />
      <rect x="5" y="5" width="140" height="56" rx="2" fill={paint} stroke="#475569" />
      <text
        x="75"
        y="44"
        text-anchor="middle"
        font-family="sans-serif"
        font-weight="900"
        font-size="30"
        textLength="126"
        lengthAdjust="spacingAndGlyphs"
        fill={ink}
      >
        {title}
      </text>
    </symbol>
  );
}

/**
 * Artwork for everything on the road, as SVG symbols. The page renders them
 * once; every frame of the road only references them with `<use>`, which keeps
 * the markup per frame small. Cars take their paint from `currentColor`.
 */
export default function Sprites() {
  return (
    <svg class="sprites" aria-hidden="true" width="0" height="0">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3b82f6" />
          <stop offset="0.55" stop-color="#93c5fd" />
          <stop offset="1" stop-color="#fde68a" />
        </linearGradient>
        {/* Warm light around the sun, fading into the sky. */}
        <radialGradient id="sun-glow">
          <stop offset="0.3" stop-color="#fef3c7" stop-opacity="0.9" />
          <stop offset="0.55" stop-color="#fde68a" stop-opacity="0.35" />
          <stop offset="1" stop-color="#fde68a" stop-opacity="0" />
        </radialGradient>
        {/* Soft puffs of tire smoke: dense in the middle, fading out at the edge. */}
        <radialGradient id="smoke">
          <stop offset="0" stop-color="#fafafa" stop-opacity="1" />
          <stop offset="0.6" stop-color="#d4d4d8" stop-opacity="0.7" />
          <stop offset="1" stop-color="#d4d4d8" stop-opacity="0" />
        </radialGradient>
      </defs>
      {/* A fluffy cloud with a slightly shaded underside. */}
      <symbol id="cloud" viewBox="0 0 200 90">
        <g fill="#e2e8f0">
          <ellipse cx="100" cy="66" rx="92" ry="20" />
          <circle cx="62" cy="54" r="28" />
          <circle cx="140" cy="54" r="26" />
        </g>
        <g fill="#fff">
          <circle cx="70" cy="48" r="26" />
          <circle cx="108" cy="36" r="34" />
          <circle cx="146" cy="50" r="22" />
          <ellipse cx="100" cy="60" rx="78" ry="14" />
        </g>
      </symbol>
      {/*
       * A seagull with a white body, grey wings with black tips and a yellow
       * beak with a red spot, gliding to the right, its long wing up and down.
       */}
      <symbol id="bird-up" viewBox="-2 -2 42 36">
        <path d="M8 16 L1 14 L2 18 L8 19 Z" fill="#cbd5e1" />
        <path
          d="M7 17 Q14 12 25 13 Q31 11 34 14 Q33 18 27 19.5 Q16 22 7 17 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          stroke-width="0.6"
        />
        <path d="M33.5 13.6 L39 15 L33.5 16.4 Z" fill="#facc15" />
        <circle cx="37.2" cy="15.4" r="0.6" fill="#dc2626" />
        <circle cx="30.8" cy="13.8" r="0.8" fill="#0f172a" />
        <path
          d="M13 15 Q15 7 19 6 L8 -1 Q18 -1 24 6 Q24 11 23 15 Z"
          fill="#94a3b8"
          stroke="#64748b"
          stroke-width="0.6"
          stroke-linejoin="round"
        />
        <path d="M8 -1 Q14 -1.5 18 1 L14 3 Z" fill="#0f172a" />
      </symbol>
      <symbol id="bird-down" viewBox="-2 -2 42 36">
        <path d="M8 16 L1 14 L2 18 L8 19 Z" fill="#cbd5e1" />
        <path
          d="M7 17 Q14 12 25 13 Q31 11 34 14 Q33 18 27 19.5 Q16 22 7 17 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          stroke-width="0.6"
        />
        <path d="M33.5 13.6 L39 15 L33.5 16.4 Z" fill="#facc15" />
        <circle cx="37.2" cy="15.4" r="0.6" fill="#dc2626" />
        <circle cx="30.8" cy="13.8" r="0.8" fill="#0f172a" />
        <path
          d="M13 17 Q15 23 19 25 L9 33 Q19 33 24 25 Q24 21 23 17 Z"
          fill="#94a3b8"
          stroke="#64748b"
          stroke-width="0.6"
          stroke-linejoin="round"
        />
        <path d="M9 33 Q14 33.5 18 31 L14 29.5 Z" fill="#0f172a" />
      </symbol>
      <Cow id="cow-a" step={1} />
      <Cow id="cow-b" step={-1} />
      <Crowd id="crowd" cheer={false} />
      <Crowd id="crowd-cheer" cheer={true} />
      {/* A formula car seen from behind. */}
      <symbol id="car" viewBox="0 0 100 60">
        <rect x="2" y="30" width="22" height="28" rx="4" fill="#111" />
        <rect x="76" y="30" width="22" height="28" rx="4" fill="#111" />
        <path d="M22 50 L28 22 L72 22 L78 50 Z" fill="currentColor" />
        <path d="M38 22 L42 10 L58 10 L62 22 Z" fill="currentColor" />
        <circle cx="50" cy="13" r="5" fill="#fbbf24" stroke="#111" stroke-width="1.5" />
        <rect x="14" y="4" width="72" height="8" rx="2" fill="currentColor" />
        <rect x="14" y="4" width="72" height="3" rx="1.5" fill="#fff" opacity="0.35" />
        <rect x="30" y="12" width="4" height="12" fill="#222" />
        <rect x="66" y="12" width="4" height="12" fill="#222" />
        <rect x="40" y="44" width="20" height="5" rx="1" fill="#111" />
        <rect x="30" y="40" width="8" height="4" rx="1" fill="#ef4444" />
        <rect x="62" y="40" width="8" height="4" rx="1" fill="#ef4444" />
      </symbol>
      <symbol id="tree" viewBox="0 0 90 120">
        <rect x="39" y="70" width="12" height="50" fill="#78350f" />
        <circle cx="45" cy="45" r="36" fill="#15803d" />
        <circle cx="30" cy="60" r="22" fill="#166534" />
        <circle cx="60" cy="58" r="24" fill="#166534" />
        <circle cx="38" cy="32" r="16" fill="#22c55e" opacity="0.6" />
      </symbol>
      <symbol id="pine" viewBox="0 0 70 150">
        <rect x="30" y="120" width="10" height="30" fill="#713f12" />
        <path
          d="M35 0 L62 60 L8 60 Z M35 30 L68 100 L2 100 Z M35 60 L70 128 L0 128 Z"
          fill="#14532d"
        />
        <path d="M35 0 L48 60 L35 60 Z M35 30 L52 100 L35 100 Z" fill="#166534" />
      </symbol>
      <symbol id="bush" viewBox="0 0 60 38">
        <ellipse cx="30" cy="26" rx="30" ry="14" fill="#4d7c0f" />
        <ellipse cx="20" cy="20" rx="14" ry="12" fill="#65a30d" />
        <ellipse cx="40" cy="18" rx="16" ry="13" fill="#65a30d" />
      </symbol>
      {BILLBOARDS.map((board, i) => (
        <Billboard id={`billboard-${i}`} {...board} />
      ))}
      <symbol id="gantry" viewBox="0 0 520 170">
        <rect x="0" y="20" width="14" height="150" fill="#e2e8f0" />
        <rect x="506" y="20" width="14" height="150" fill="#e2e8f0" />
        <rect x="0" y="10" width="520" height="40" fill="#b91c1c" />
        <text
          x="260"
          y="40"
          text-anchor="middle"
          font-family="sans-serif"
          font-weight="900"
          font-size="28"
          fill="#fff"
          letter-spacing="8"
        >
          START · FINISH
        </text>
      </symbol>
    </svg>
  );
}
