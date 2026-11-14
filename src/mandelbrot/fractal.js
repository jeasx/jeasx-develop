export const WIDTH = 960;
export const HEIGHT = 480;
export const STRIP = 32;

/** Default view: the whole set. */
export const HOME = { x: -0.6, y: 0, zoom: 1 };

/** Milliseconds of computing before render() lets the event loop handle other work. */
const BREAK_AFTER = 8;

/** Width of the complex plane covered at zoom 1. */
const SPAN = 3.2;

/** Parses and clamps the view from the query string. */
export function parseView(query) {
  const num = (value, fallback) => {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    x: Math.min(Math.max(num(query.x, HOME.x), -2.5), 1.5),
    y: Math.min(Math.max(num(query.y, HOME.y), -1.5), 1.5),
    zoom: Math.min(Math.max(num(query.zoom, HOME.zoom), 1), 1e13),
  };
}

/** More iterations are needed to resolve detail the deeper we zoom. */
export function maxIterations(zoom) {
  return Math.round(200 + 120 * Math.log2(zoom));
}

/** Width of the visible part of the complex plane. */
export function planeWidth(view) {
  return SPAN / view.zoom;
}

/** Maps a pixel of the image to a point of the complex plane. */
export function toPlane(view, px, py, width = WIDTH, height = HEIGHT) {
  const scale = SPAN / view.zoom / width;
  return {
    x: view.x + (px - width / 2) * scale,
    y: view.y + (py - height / 2) * scale,
  };
}

/**
 * Computes rows [top, top + rows) of an image with the given size as SVG paths.
 * Neighbouring pixels of the same color in a row are merged into one horizontal line,
 * and all lines of one color share a single path, which keeps the markup small.
 * Resolves to a list of `{ color, d }`, one entry per color.
 */
export async function render(view, { width, height, top = 0, rows = height }) {
  const max = maxIterations(view.zoom);
  /** @type {Map<string, string[]>} */
  const paths = new Map();
  let lastBreak = performance.now();
  for (let py = 0; py < rows; py++) {
    // Computing blocks the only thread of the server. Take a break every few milliseconds,
    // so other requests (e.g. the stylesheets this page needs to be painted) aren't stuck.
    if (performance.now() - lastBreak > BREAK_AFTER) {
      await new Promise((resolve) => setImmediate(resolve));
      lastBreak = performance.now();
    }
    let start = 0;
    let current = "";
    for (let px = 0; px <= width; px++) {
      let hex = "";
      if (px < width) {
        const c = toPlane(view, px, top + py, width, height);
        hex = color(escape(c.x, c.y, max), max);
      }
      if (hex !== current) {
        if (current) {
          const segments = paths.get(current) ?? [];
          segments.push(`M${start} ${py}.5h${px - start}`);
          paths.set(current, segments);
        }
        current = hex;
        start = px;
      }
    }
  }
  return [...paths].map(([color, segments]) => ({
    color,
    d: segments.join(""),
  }));
}

/** Returns a smooth (fractional) iteration count, or -1 for points inside the set. */
function escape(cx, cy, max) {
  // Skip the main cardioid and the period-2 bulb, they are always inside.
  const q = (cx - 0.25) ** 2 + cy * cy;
  if (q * (q + (cx - 0.25)) <= 0.25 * cy * cy || (cx + 1) ** 2 + cy * cy <= 0.0625) return -1;

  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;
  let n = 0;
  while (x2 + y2 <= 256 && n < max) {
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
    x2 = x * x;
    y2 = y * y;
    n++;
  }
  if (n >= max) return -1;
  return n + 1 - Math.log2(Math.log2(x2 + y2) / 2);
}

/**
 * Cosine palette from dark blue over magenta to gold, as hex color.
 * Channels are rounded to 16 levels, so neighbouring pixels share colors more often.
 */
function color(n, max) {
  if (n < 0) return "#011";
  const t = Math.sqrt(n / max) * 6;
  const fade = Math.min(1, n / 8);
  return (
    "#" +
    [0, 0.15, 0.3]
      .map((phase) => {
        const v = (0.5 + 0.5 * Math.cos(6.2832 * (t + phase))) * fade;
        return Math.round(v * 15).toString(16);
      })
      .join("")
  );
}
