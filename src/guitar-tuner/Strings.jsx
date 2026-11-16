import { STRINGS } from "./pitch";

/**
 * The six open strings. The string nearest to the detected pitch lights up; pressing a
 * string repeats its reference tone until it is pressed again, so the guitar can be
 * tuned by ear without a microphone.
 *
 * @param {{ active?: number | null, playing?: number | null }} props
 */
export default function Strings({ active = null, playing = null }) {
  return (
    <ol class="strings">
      {STRINGS.map((string, index) => (
        <li>
          <button
            type="button"
            class={["string", index === active && "active", index === playing && "playing"]
              .filter(Boolean)
              .join(" ")}
            data-string={String(index)}
            aria-pressed={index === playing ? "true" : "false"}
            title={`Repeat ${string.name}${string.octave} (${string.frequency.toFixed(2)} Hz)`}
          >
            {/* Low strings are drawn thicker, like on the guitar. */}
            <span class="wire" style={`--gauge: ${3.5 - index * 0.5}px`} />
            <span class="name">
              {string.name}
              <sub>{string.octave}</sub>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
