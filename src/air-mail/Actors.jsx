import { CRASH_TIME, pitch } from "./game";
import { HEIGHT, PLANE_X, SUN, WIDTH } from "./shared";

const round = (n) => Math.round(n * 10) / 10;

/**
 * The mail plane: an open-cockpit plane in yellow and red with a low wing.
 * The pilot wears a leather cap and goggles, and a scarf flutters in the wind.
 */
function Plane({ state }) {
  const spin = state.fuel > 0 && (state.speed > 0 || !state.landed);
  // A blade sweeps around inside the blur; a stopped propeller stands still.
  const blade = spin ? round(Math.cos(state.clock * 55) * 5.8) : 5.4;
  const blink = state.safe > 0 && Math.floor(state.safe * 8) % 2 === 1;
  // The scarf flutters faster the faster the plane flies.
  const flutter = round(Math.sin(state.clock * (8 + state.speed / 8)) * 0.9);
  // ...and streams out further: from 4.6 units at rest to 9 at top speed.
  const tail = round(0.8 - 4.6 - Math.min(state.speed, 110) * 0.04);
  const mid = round((0.8 + tail) / 2);
  return (
    <g
      class="plane"
      transform={`translate(${PLANE_X} ${round(state.y)}) rotate(${round(pitch(state))})`}
      opacity={blink ? 0.35 : undefined}
    >
      {/* Landing gear behind the fuselage. */}
      <path class="gear" d="M2.4,3.2L3.6,5M0.6,3.4L3.2,5M-11.6,1L-12.4,1.9" />
      <circle class="tire" cx="3.6" cy="5" r="1.6" />
      <circle class="hubcap" cx="3.6" cy="5" r="0.55" />
      <circle class="tire" cx="-12.5" cy="2.1" r="0.6" />
      {/* Tail: fin with a striped rudder and the horizontal stabilizer. */}
      <path class="fin" d="M-13.6,-1.4L-15.6,-9.2Q-14.6,-9.8 -12.8,-9.2L-9.2,-2.4Z" />
      <path class="rudder" d="M-15.1,-7.4L-13,-7.6M-14.6,-5.6L-12.1,-5.8" />
      <path class="stabilizer" d="M-15.4,0Q-12,-0.9 -8.6,-0.2Q-12,0.8 -15.4,0Z" />
      {/* Fuselage, shaded from the sunny top to the belly, with a cheat line. */}
      <path
        class="fuselage"
        d="M-14.2,-1.1L-6,-3.4L1,-3.9L8.6,-3.7Q11.2,-3.4 11.3,-1L11.3,1.5Q11.1,3 9,3.4L-1,3.7L-8,2.3L-14.2,0.7Z"
      />
      <path class="cheat" d="M-14,0.1L-1,1L11.2,0.9" />
      <path class="cheat-line" d="M-13.8,-0.6L-1,0.2L11.2,0.1" />
      {/* The open cockpit: the pilot sits in it behind a small windscreen. */}
      <path
        class="scarf"
        d={`M0.8,-4.6Q${mid},${round(-5.2 + flutter)} ${tail},${round(-4.4 - flutter)}L${round(tail + 0.2)},${round(-3.7 - flutter)}Q${mid},${round(-4.4 + flutter)} 0.8,-3.9Z`}
      />
      <path class="jacket" d="M-0.6,-3.6Q-0.4,-5.2 1.3,-5.2Q3,-5.2 3.2,-3.6Z" />
      <circle class="face" cx="1.5" cy="-6.1" r="1.15" />
      <path class="leather-cap" d="M0.3,-6.2A1.2,1.2 0 0 1 2.7,-6.4L2.4,-6.1H0.6Z" />
      <path class="strap" d="M0.4,-6.3L2.7,-6.2" />
      <circle class="goggles" cx="2.35" cy="-6.25" r="0.5" />
      <path class="cockpit" d="M-1,-3.75Q1.3,-4.3 3.6,-3.85" />
      <path class="windscreen" d="M3.8,-3.9L4.5,-5.5L5.6,-3.8Z" />
      {/* Engine: metal cowling with cooling slits and an exhaust. */}
      <path class="cowling" d="M8.6,-3.7Q11.2,-3.4 11.3,-1L11.3,1.5Q11.1,3 9,3.4Z" />
      <path class="slits" d="M9.6,-1.6v2M10.4,-1.4v1.8" />
      <rect class="exhaust" x="7.4" y="3.1" width="2.2" height="0.8" rx="0.4" />
      {/* The low wing along the belly. */}
      <path class="wing" d="M-5.4,2.4Q-5.4,0.6 -1.4,0.6H7.6Q9.6,0.7 9.4,1.9Q9.2,2.6 7.8,2.6H-4Z" />
      <path class="wing-edge" d="M-4.6,1.1H8.4" />
      {/* Propeller: spinner, blur disc and one sweeping blade. */}
      {spin && <ellipse class="prop-disc" cx="12.2" cy="0.2" rx="0.8" ry="6" />}
      <path class="blade" d={`M12.2,0.2V${round(0.2 - blade)}M12.2,0.2V${round(0.2 + blade)}`} />
      <path class="spinner" d="M11.3,-1.3Q13.8,-0.6 13.9,0.2Q13.8,1 11.3,1.7Z" />
    </g>
  );
}

/**
 * A parcel, first tumbling as it falls, then hanging from its parachute and
 * swinging from left to right like a pendulum below the canopy.
 */
function Parcel({ drop, camera }) {
  const x = round(drop.x - camera);
  const y = round(drop.y);
  if (drop.t <= 0.45) {
    return (
      <g class="parcel" transform={`rotate(${round(drop.t * 300)} ${x} ${y})`}>
        <rect class="box" x={x - 2} y={y - 2} width="4" height="4" rx="0.5" />
        <path class="string" d={`M${x},${y - 2}v4M${x - 2},${y}h4`} />
      </g>
    );
  }
  // The chute pops open with a little overshoot, then breathes as the air fills
  // it; the swing builds up after it opens and the canopy tilts along a little.
  const open = drop.t - 0.45;
  const k = Math.min(1, open / 0.3);
  const pop = 1 - (1 - k) ** 3 + Math.sin(k * Math.PI) * 0.2;
  const breath = Math.sin(open * 7) * 0.07;
  const swing = Math.sin(open * 3.2) * 20 * Math.min(1, open * 1.5);
  const pivot = `${x} ${y - 10}`;
  return (
    <g class="parcel">
      <g transform={`translate(${x} ${y - 2}) scale(${round(pop)}) translate(${-x} ${-(y - 2)})`}>
        <g
          transform={`translate(${x} ${y - 10}) rotate(${round(swing * 0.35)}) scale(${round(1 + breath)} ${round(1 - breath)})`}
        >
          <path class="chute" d={CANOPY} />
          <path class="gores" d={GORES} />
          <path class="shade" d="M0,-5.2Q-7,-4.2 -7,3Q-5.25,1.6 -3.5,3Q-1.75,1.6 0,3Z" />
          <path class="hem" d={CANOPY} />
          <circle class="vent" cx="0" cy="-4.9" r="0.7" />
        </g>
        <g transform={`rotate(${round(swing)} ${pivot})`}>
          <path
            class="lines"
            d={`M${x - 7},${y - 7}L${x - 1.6},${y - 2}M${x - 3.5},${y - 7}L${x - 0.6},${y - 2}M${x + 3.5},${y - 7}L${x + 0.6},${y - 2}M${x + 7},${y - 7}L${x + 1.6},${y - 2}`}
          />
          <rect class="box" x={x - 2} y={y - 2} width="4" height="4" rx="0.5" />
          <path class="string" d={`M${x},${y - 2}v4M${x - 2},${y}h4`} />
        </g>
      </g>
    </g>
  );
}

/** The canopy around its centre: a dome with a scalloped hem. */
const CANOPY =
  "M-7,3Q-7,-4.2 0,-5.2Q7,-4.2 7,3Q5.25,1.6 3.5,3Q1.75,1.6 0,3Q-1.75,1.6 -3.5,3Q-5.25,1.6 -7,3Z";
/** Every second panel of the canopy is red. */
const GORES = [
  [-7, -3.5],
  [0, 3.5],
]
  .map(([a, b]) => `M${a},3Q${a},-4.2 0,-5.2Q${b},-4.2 ${b},3Q${(a + b) / 2},1.6 ${a},3Z`)
  .join("");

/** Fire, smoke and pieces of the plane where it crashed. */
function Crash({ state, camera }) {
  const p = 1 - state.crash / CRASH_TIME;
  const x = state.crashX - camera;
  const y = state.crashY;
  return (
    <g class="crash" opacity={round(Math.min(1, (1 - p) * 3))}>
      {[0, 1, 2, 3].map((n) => (
        <circle
          class="smoke"
          cx={round(x + Math.sin(n * 2.1) * 4 + p * 6)}
          cy={round(y - p * 30 - n * 6)}
          r={round(3 + p * 8 + n)}
        />
      ))}
      <circle
        class="fire"
        cx={round(x)}
        cy={round(y)}
        r={round(4 + Math.sin(state.clock * 30) + (1 - p) * 4)}
      />
      {[0, 1, 2, 3, 4, 5].map((n) => {
        const angle = n * 1.05 + 0.3;
        const t = Math.min(p * 2, 1);
        return (
          <rect
            class={n % 2 ? "piece red" : "piece"}
            x={round(x + Math.cos(angle) * 24 * t)}
            y={round(y - Math.sin(angle) * 18 * t + 30 * t * t)}
            width="2.4"
            height="1.4"
          />
        );
      })}
    </g>
  );
}

/** Discs and rings of a lens flare, along the line from the sun through the middle of the screen. */
const FLARES = [
  { t: 0.45, r: 4, kind: "warm" },
  { t: 0.8, r: 2, kind: "warm" },
  { t: 1.15, r: 9, kind: "ring" },
  { t: 1.45, r: 3, kind: "cool" },
  { t: 1.75, r: 6, kind: "violet" },
];

/** A lens flare in front of everything, as if the sun shone into the camera. */
function Flare({ clock }) {
  const dx = WIDTH / 2 - SUN.x;
  const dy = HEIGHT / 2 - SUN.y;
  const shimmer = 0.8 + Math.sin(clock * 1.3) * 0.2;
  return (
    <g class="flare" opacity={round(shimmer)}>
      {FLARES.map((f) => (
        <circle class={f.kind} cx={round(SUN.x + dx * f.t)} cy={round(SUN.y + dy * f.t)} r={f.r} />
      ))}
    </g>
  );
}

/** Everything that moves: the plane, its exhaust, parcels and the points they score. */
export default function Actors({ state }) {
  const camera = state.x - PLANE_X;
  return (
    <svg
      class="layer actors"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Flare clock={state.clock} />
      {state.trail.map((puff, n) => (
        <circle
          class="puff"
          cx={round(puff.x - camera - (state.clock - puff.t) * 6)}
          cy={round(puff.y - (state.clock - puff.t) * 5)}
          r={round(1 + (state.clock - puff.t) * 5)}
          opacity={round(Math.max(0, 0.6 - n * 0.08))}
        />
      ))}
      {state.drops.map((drop) => (
        <Parcel drop={drop} camera={camera} />
      ))}
      {state.crash > 0 ? (
        <Crash state={state} camera={camera} />
      ) : (
        state.status !== "over" && <Plane state={state} />
      )}
      {state.popups.map((p) => (
        <text
          class={`popup ${p.kind}`}
          x={round(p.x - camera)}
          y={round(p.y - p.t * 12)}
          opacity={round(Math.min(1, (1.4 - p.t) * 2))}
        >
          {p.text}
        </text>
      ))}
    </svg>
  );
}
