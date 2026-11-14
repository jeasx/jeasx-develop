const WIDTH = 240;
const HEIGHT = 40;

/** Generation, population and a sparkline of the population over the last generations. */
export default function Stats({ generation, history }) {
  const population = history.at(-1);
  const max = Math.max(1, ...history);
  const points = history
    .map((value, i) => {
      const x = history.length > 1 ? (i / (history.length - 1)) * WIDTH : WIDTH;
      return `${x.toFixed(1)},${(HEIGHT - (value / max) * (HEIGHT - 4) - 2).toFixed(1)}`;
    })
    .join(" ");
  return (
    <div class="stats">
      <div class="stat">
        <span>Generation</span>
        <strong>{generation}</strong>
      </div>
      <div class="stat">
        <span>Population</span>
        <strong>{population}</strong>
      </div>
      <svg
        class="sparkline"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points={`0,${HEIGHT} ${points} ${WIDTH},${HEIGHT}`} class="area" />
        <polyline points={points} class="line" />
      </svg>
      {population === 0 && (
        <p class="hint">Everything died out. Paint some cells or press Random.</p>
      )}
    </div>
  );
}
