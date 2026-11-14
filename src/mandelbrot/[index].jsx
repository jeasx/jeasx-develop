import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import Picture from "./Picture";
import {
  HEIGHT,
  HOME,
  STRIP,
  WIDTH,
  maxIterations,
  parseView,
  render,
  planeWidth,
} from "./fractal";

/** Key in sessionStorage for the scroll position, see RestoreScroll and index.js. */
const SCROLL_KEY = "mandelbrot-scroll";

/** The quick preview is rendered at 1/PREVIEW of the final resolution. */
const PREVIEW = 8;

const PLACES = [
  { name: "Whole set", ...HOME },
  { name: "Seahorse valley", x: -0.7453, y: 0.1127, zoom: 150 },
  { name: "Elephant valley", x: 0.2821, y: 0.01, zoom: 60 },
  { name: "Spiral", x: -0.761574, y: -0.0847596, zoom: 4000 },
  { name: "Mini Mandelbrot", x: -1.7685, y: 0.00173, zoom: 1500 },
];

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const query = /** @type {Record<string, string>} */ (request.query);
  const view = parseView(query);

  const start = Date.now();

  return (
    <Layout
      title="Mandelbrot explorer"
      description="A Mandelbrot set explorer rendered on the server and streamed strip by strip to the browser."
      css="/mandelbrot/index.css"
      script="/mandelbrot/index.js"
    >
      <h1>Mandelbrot explorer</h1>
      <p>
        Every pixel of this fractal is computed on the server and sent as inline SVG: neighbouring
        pixels of the same color are merged into horizontal lines, and all lines of one color share
        a single path. To show something as early as possible, the page first streams a blurry
        preview at 1/
        {PREVIEW} of the resolution. Then an <code>async function*</code> component computes the
        image in strips of {STRIP} rows and yields each strip as soon as it is ready, so the sharp
        picture builds up from top to bottom while the rest is still being computed.
      </p>
      <p>
        Click into the image to zoom in by a factor of four, or drag a box to zoom into that area. A
        small script turns your selection into new coordinates and reloads the page, which keeps
        your scroll position. Everything else happens on the server.
      </p>

      <section class="mb-explorer" aria-label="Explorer">
        <header class="mb-bar">
          <nav class="mb-places" aria-label="Places">
            {PLACES.map((place) => (
              <a
                href={link(place)}
                data-keep-scroll
                aria-current={isAt(view, place) ? "page" : undefined}
              >
                {place.name}
              </a>
            ))}
          </nav>
          <div class="mb-actions">
            <a
              class="mb-icon"
              href={link({ ...view, zoom: Math.max(1, view.zoom / 4) })}
              data-keep-scroll
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Icon d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5-5M8 11h6" />
            </a>
            <a
              class="mb-icon"
              href={`svg${link(view)}`}
              target="_blank"
              title="Open SVG in new tab"
              aria-label="Open SVG in new tab"
            >
              <Icon d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </a>
          </div>
        </header>

        <div class="mb-progress" aria-hidden="true">
          <span></span>
        </div>

        <div
          class="mb-canvas"
          id="canvas"
          style={`aspect-ratio: ${WIDTH} / ${HEIGHT}`}
          data-x={view.x}
          data-y={view.y}
          data-zoom={view.zoom}
          data-span={planeWidth(view)}
        >
          <Preview view={view} />
          <RestoreScroll />
          <div class="mb-strips" style={`--strip-ratio: ${WIDTH} / ${STRIP}`}>
            <Strips view={view} />
          </div>
          <div class="mb-scan" aria-hidden="true"></div>
          <p class="mb-hint" aria-hidden="true">
            Click to zoom · drag to select
          </p>
        </div>

        <dl class="mb-hud">
          <div>
            <dt>Real</dt>
            <dd>{view.x.toPrecision(12)}</dd>
          </div>
          <div>
            <dt>Imaginary</dt>
            <dd>{view.y.toPrecision(12)}i</dd>
          </div>
          <div>
            <dt>Zoom</dt>
            <dd>{formatZoom(view.zoom)}×</dd>
          </div>
          <div>
            <dt>Iterations</dt>
            <dd>{maxIterations(view.zoom)}</dd>
          </div>
          <div>
            <dt>Rendered in</dt>
            <dd class="mb-time">
              <span class="mb-busy">streaming…</span>
              <Done start={start} />
            </dd>
          </div>
        </dl>
      </section>
    </Layout>
  );
}

/** The low resolution preview: tiny, so it is computed in a few milliseconds. */
async function Preview({ view }) {
  // Flush the shell before computing, so the browser can paint it right away.
  await nextTick();
  const width = WIDTH / PREVIEW;
  const height = HEIGHT / PREVIEW;
  return (
    <Picture
      class="mb-preview"
      paths={await render(view, { width, height })}
      width={width}
      height={height}
      label="Mandelbrot set"
    />
  );
}

/** Computes the full resolution image strip by strip and streams each strip immediately. */
async function* Strips({ view }) {
  for (let top = 0; top < HEIGHT; top += STRIP) {
    // Computing blocks the event loop, so flush everything rendered so far first.
    await nextTick();
    const paths = await render(view, {
      width: WIDTH,
      height: HEIGHT,
      top,
      rows: STRIP,
    });
    yield (
      <>
        <Picture paths={paths} width={WIDTH} height={STRIP} />
        {/* Moves the progress bar and scan line, later rules win over earlier ones. */}
        {html(`<style>.mb-explorer{--progress:${((top + STRIP) / HEIGHT).toFixed(3)}}</style>`)}
      </>
    );
  }
}

/**
 * Restores the scroll position saved by the zoom script before the page was reloaded.
 * It runs inline right after the preview, so the page jumps back while the strips are
 * still streaming instead of after the whole image is loaded.
 *
 * Safari ignores or resets a scroll position set before its first layout, and while
 * streaming the document may still be too short for it. So the script reserves enough
 * height and applies the position again on every frame until the page is loaded,
 * unless the user starts scrolling on their own.
 */
function RestoreScroll() {
  return html(`<script>
(() => {
  let y;
  try {
    y = sessionStorage.getItem("${SCROLL_KEY}");
    sessionStorage.removeItem("${SCROLL_KEY}");
  } catch {}
  if (y === null || y === undefined) return;
  y = Number(y);
  const root = document.documentElement;
  root.style.minHeight = y + innerHeight + "px";
  let active = true;
  const stop = () => {
    active = false;
    root.style.minHeight = "";
    ["wheel", "touchstart", "keydown"].forEach((type) => removeEventListener(type, stop));
  };
  ["wheel", "touchstart", "keydown"].forEach((type) =>
    addEventListener(type, stop, { passive: true }),
  );
  const apply = () => {
    if (!active) return;
    if (Math.abs(scrollY - y) > 1) scrollTo(0, y);
    requestAnimationFrame(apply);
  };
  apply();
  // Keep it a moment after loading, Safari may reset the position once more.
  addEventListener("load", () => setTimeout(() => active && stop(), 100));
})();
</script>`);
}

/**
 * Waits for the next turn of the event loop. Rendered markup is only written to the
 * socket when the event loop gets a chance, not while synchronous work is running.
 */
function nextTick() {
  return new Promise((resolve) => setImmediate(resolve));
}

function Done({ start }) {
  return <span class="mb-done">{Date.now() - start} ms</span>;
}

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Whether the view shows the given place. */
function isAt(view, place) {
  return view.x === place.x && view.y === place.y && view.zoom === place.zoom;
}

function link(view) {
  const { x, y, zoom } = parseView({ x: view.x, y: view.y, zoom: view.zoom });
  return `?${new URLSearchParams({ x: String(x), y: String(y), zoom: String(zoom) })}`;
}

function formatZoom(zoom) {
  return zoom < 1e6 ? Math.round(zoom).toLocaleString("en") : zoom.toExponential(1);
}
