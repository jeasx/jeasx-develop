import { niceTicks, scaleLinear, spreadLabels } from "./scale";

const format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/**
 * A line chart for several series with a shared x axis. Hovering a column shows a
 * crosshair and a tooltip with all values of that column (via CSS and <title>, no JavaScript).
 *
 * @param {{
 *   labels: string[],
 *   series: { name: string, color: string, values: number[] }[],
 *   unit?: string,
 *   title: string,
 * }} props
 */
export function LineChart({ labels, series, unit = "", title }) {
  const width = 720;
  const height = 320;
  const margin = { top: 16, right: 80, bottom: 32, left: 44 };

  const values = series.flatMap((s) => s.values);
  const ticks = niceTicks(Math.min(...values), Math.max(...values), 6);
  const x = scaleLinear([0, labels.length - 1], [margin.left, width - margin.right]);
  const y = scaleLinear([ticks[0], ticks.at(-1)], [height - margin.bottom, margin.top]);
  const columnWidth = x(1) - x(0);

  // Direct labels at the end of each line, moved apart where lines end close together.
  const endLabels = spreadLabels(
    series.map((s) => ({ name: s.name, y: y(s.values.at(-1)) })),
    16,
  );

  return (
    <svg class="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <Grid ticks={ticks} y={y} left={margin.left} right={width - margin.right} unit={unit} />
      {labels.map((label, i) => (
        <text class="axis-label" x={x(i)} y={height - 8} text-anchor="middle">
          {label}
        </text>
      ))}
      {series.map((s) => (
        <polyline
          class="line"
          stroke={s.color}
          points={s.values.map((value, i) => `${x(i)},${y(value)}`).join(" ")}
        />
      ))}
      {endLabels.map(({ name, y }) => (
        <text class="direct-label" x={width - margin.right + 8} y={y} dominant-baseline="middle">
          {name}
        </text>
      ))}
      {labels.map((label, i) => (
        <g class="column">
          <title>
            {[label, ...series.map((s) => `${s.name}: ${format.format(s.values[i])}${unit}`)].join(
              "\n",
            )}
          </title>
          {/* The hit area covers the whole column, so it is much bigger than the marks. */}
          <rect
            class="hit"
            x={x(i) - columnWidth / 2}
            y={margin.top}
            width={columnWidth}
            height={height - margin.top - margin.bottom}
          />
          <line class="crosshair" x1={x(i)} x2={x(i)} y1={margin.top} y2={height - margin.bottom} />
          {series.map((s) => (
            <circle class="marker" cx={x(i)} cy={y(s.values[i])} r="4" fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * A bar chart for one series. Each bar has a tooltip and its value as label.
 *
 * @param {{ items: { label: string, value: number }[], color: string, title: string }} props
 */
export function BarChart({ items, color, title }) {
  const width = 720;
  const height = 300;
  const margin = { top: 24, right: 8, bottom: 32, left: 44 };

  const ticks = niceTicks(0, Math.max(...items.map((item) => item.value)), 5);
  const y = scaleLinear([0, ticks.at(-1)], [height - margin.bottom, margin.top]);
  const band = (width - margin.left - margin.right) / items.length;
  const barWidth = Math.min(band * 0.6, 48);

  return (
    <svg class="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <Grid ticks={ticks} y={y} left={margin.left} right={width - margin.right} />
      {items.map(({ label, value }, i) => {
        const center = margin.left + band * i + band / 2;
        return (
          <g class="bar">
            <title>{`${label}: ${format.format(value)}`}</title>
            <rect
              class="hit"
              x={center - band / 2}
              y={margin.top}
              width={band}
              height={height - margin.top - margin.bottom}
            />
            <path
              d={roundedTop(center - barWidth / 2, y(value), barWidth, y(0) - y(value))}
              fill={color}
            />
            <text class="value-label" x={center} y={y(value) - 6} text-anchor="middle">
              {format.format(value)}
            </text>
            <text class="axis-label" x={center} y={height - 8} text-anchor="middle">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * A tiny line without axes, e.g. for a table cell. Marks the highest and lowest value.
 *
 * @param {{ values: number[], color: string, label: string }} props
 */
export function Sparkline({ values, color, label }) {
  const width = 120;
  const height = 32;
  const padding = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = scaleLinear([0, values.length - 1], [padding, width - padding]);
  const y = scaleLinear([min, max], [height - padding, padding]);

  return (
    <svg
      class="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
    >
      <polyline
        class="line"
        stroke={color}
        points={values.map((value, i) => `${x(i)},${y(value)}`).join(" ")}
      />
      {[values.indexOf(max), values.indexOf(min)].map((i) => (
        <circle cx={x(i)} cy={y(values[i])} r="3" fill={color} />
      ))}
    </svg>
  );
}

/**
 * Horizontal gridlines with tick labels on the left.
 *
 * @param {{ ticks: number[], y: (value: number) => number, left: number, right: number, unit?: string }} props
 */
function Grid({ ticks, y, left, right, unit = "" }) {
  return (
    <g>
      {ticks.map((tick) => (
        <>
          <line
            class={tick === 0 ? "baseline" : "gridline"}
            x1={left}
            x2={right}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text
            class="axis-label"
            x={left - 8}
            y={y(tick)}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {format.format(tick)}
            {unit}
          </text>
        </>
      ))}
    </g>
  );
}

/**
 * Path of a bar with rounded top corners, anchored to the baseline at the bottom.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
function roundedTop(x, y, width, height) {
  if (height <= 0) {
    return "";
  }
  const r = Math.min(4, height, width / 2);
  const bottom = y + height;
  return `M${x},${bottom}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${bottom}Z`;
}
