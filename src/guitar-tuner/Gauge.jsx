import { IN_TUNE } from "./pitch";

/** Cents covered by each half of the dial. */
const RANGE = 50;

/** Colored bands along the arc, from far off over close to in tune. */
const BANDS = [
  { from: -50, to: -20, tone: "far" },
  { from: -20, to: -IN_TUNE, tone: "near" },
  { from: -IN_TUNE, to: IN_TUNE, tone: "zone" },
  { from: IN_TUNE, to: 20, tone: "near" },
  { from: 20, to: 50, tone: "far" },
];

/**
 * An arc from -50 to +50 cents with a needle for the detected offset and the
 * note in its center. Without a note, the marker rests in the middle and the dial is dimmed.
 *
 * @param {{ note?: { name: string, octave: number, cents: number } | null, frequency?: number | null }} props
 */
export default function Gauge({ note = null, frequency = null }) {
  const cents = note ? Math.max(-RANGE, Math.min(RANGE, note.cents)) : 0;
  const state = !note
    ? "idle"
    : Math.abs(note.cents) <= IN_TUNE
      ? "tuned"
      : note.cents < 0
        ? "flat"
        : "sharp";
  const ticks = Array.from({ length: 21 }, (_, i) => (i - 10) * 5);
  return (
    <div class={`gauge ${state}`}>
      <svg viewBox="-125 -125 250 135" aria-hidden="true">
        {BANDS.map(({ from, to, tone }) => (
          <path class={`band ${tone}`} d={arc(from, to, 100)} />
        ))}
        {ticks.map((tick) => (
          <line
            class={tick % 25 === 0 ? "tick major" : "tick"}
            y1={-110}
            y2={tick % 25 === 0 ? -118 : -114}
            transform={`rotate(${angle(tick)})`}
          />
        ))}
        <text class="label" x="-104" y="6">
          ♭
        </text>
        <text class="label" x="104" y="6">
          ♯
        </text>
        <g class="marker" style={`transform: rotate(${angle(cents)}deg)`}>
          {/* A tapered needle across the arc, short enough to leave the note free. */}
          <path class="needle" d="M -0.6 -124 L 0.6 -124 L 2.6 -78 A 2.6 2.6 0 0 1 -2.6 -78 Z" />
          <line class="shine" y1="-120" y2="-80" />
        </g>
      </svg>
      <div class="readout" role="status" aria-live="polite">
        <strong class="note">
          {note ? note.name : ""}
          <sub>{note ? note.octave : ""}</sub>
        </strong>
        <span class="cents">
          {note ? `${note.cents > 0 ? "+" : ""}${note.cents} cents` : "Play a string"}
        </span>
      </div>
      <p class="status">
        <span class="hint-text">
          {state === "tuned"
            ? "In tune"
            : state === "flat"
              ? "Tune up ↑"
              : state === "sharp"
                ? "Tune down ↓"
                : " "}
        </span>
        <span class="hz">{frequency ? `${frequency.toFixed(1)} Hz` : ""}</span>
      </p>
    </div>
  );
}

/** Rotation in degrees for an offset in cents; the dial spans 160 degrees. */
function angle(cents) {
  return (cents / RANGE) * 80;
}

/** An SVG arc around the center between two offsets in cents. */
function arc(from, to, radius) {
  const point = (cents) => {
    const radians = ((angle(cents) - 90) * Math.PI) / 180;
    return `${(radius * Math.cos(radians)).toFixed(2)} ${(radius * Math.sin(radians)).toFixed(2)}`;
  };
  return `M ${point(from)} A ${radius} ${radius} 0 0 1 ${point(to)}`;
}
