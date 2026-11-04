/** Renders one planet as soon as its data has arrived. */
export default async function Planet({ planet }) {
  const { name, color, diameter, distance, year, moons, gravity } =
    await planet;
  // Square root keeps Jupiter on screen without shrinking Mercury to a dot.
  const size = Math.round(Math.sqrt(diameter) * 0.18);
  const id = name.toLowerCase();
  return (
    <div
      class="planet"
      tabindex="0"
      role="button"
      aria-pressed="false"
      style={`--color: ${color}; --size: ${size}px`}
    >
      <div class="front">
        <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-shade`} cx="35%" cy="35%">
              <stop offset="0%" stop-color="#fff" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#000" stop-opacity="0.45" />
            </radialGradient>
          </defs>
          <g class="globe">
            <circle cx="100" cy="100" r={size} fill={color} />
            <circle cx="100" cy="100" r={size} fill={`url(#${id}-shade)`} />
            {name === "Saturn" && (
              <ellipse
                class="ring"
                cx="100"
                cy="100"
                rx={size * 1.5}
                ry={size * 0.45}
                fill="none"
                stroke={color}
                stroke-width="5"
              />
            )}
          </g>
        </svg>
        <p class="caption">
          <strong>{name}</strong>
          <small>
            {diameter.toLocaleString("en-US")} km · {distance} AU ·{" "}
            {year.toLocaleString("en-US")} days · {moons}{" "}
            {moons === 1 ? "moon" : "moons"}
          </small>
        </p>
      </div>
      <div class="back" aria-hidden="true">
        <strong>{name}</strong>
        <dl>
          <dt>You would weigh</dt>
          <dd>{Math.round((70 * gravity) / 9.81)} kg instead of 70 kg</dd>
          <dt>Sunlight arrives in</dt>
          <dd>{lightTime(distance)}</dd>
        </dl>
      </div>
    </div>
  );
}

/** Light needs about 499 seconds for one AU. */
function lightTime(distance) {
  const minutes = (distance * 499) / 60;
  return minutes < 60
    ? `${Math.round(minutes)} minutes`
    : `${(minutes / 60).toLocaleString("en-US", { maximumFractionDigits: 1 })} hours`;
}
