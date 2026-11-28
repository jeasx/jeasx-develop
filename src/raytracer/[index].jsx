import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import { THREADS, traceTile } from "./pool";
import { HEIGHT, TILE, WIDTH, parseView, tiles } from "./tracer";

const QUALITY = [
  { samples: 1, name: "Draft" },
  { samples: 2, name: "Good" },
  { samples: 4, name: "High" },
  { samples: 6, name: "Cinematic" },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const query = /** @type {Record<string, string>} */ (request.query);
  const view = parseView(query);
  // "browser" traces the image in Web Workers instead of on the server.
  const workers = query.renderer === "browser";
  const link = (change) => {
    const { angle, samples, browser } = { ...view, browser: workers, ...change };
    // The anchor brings the reloaded page back to the image instead of the top.
    return `?angle=${angle}&samples=${samples}${browser ? "&renderer=browser" : ""}#studio`;
  };
  const start = Date.now();

  return (
    <Layout
      title="Live ray tracer"
      description="A ray tracer running on the server, streaming every finished tile as a PNG."
      css="/raytracer/index.css"
      script="/raytracer/index.js"
    >
      <h1>Live ray tracer</h1>
      <p class="lead">
        This scene is ray traced on the server while you watch, in plain JavaScript without any
        dependencies.
      </p>
      <p>
        Glossy and mirror spheres rest on a soft rubber sheet, each sinking into it by its weight.
        A low sun throws long shadows across the bent checkerboard, its light bounces between the
        spheres and the sheet, and a lens flare with ghosts and streaks completes the view.
      </p>
      <p>
        The image is traced in {TILE}×{TILE} pixel tiles, spiralling outwards from the center, by
        a pool of worker threads on the server: one per CPU core, shared by all requests, so the
        main thread stays free. Every finished tile is encoded as a PNG with nothing but{" "}
        <code>node:zlib</code>, and an <code>async function*</code> component streams it right
        away as an <code>&lt;img&gt;</code> with a data URL. CSS grid puts each tile in place, no matter in which order it arrives. Apart
        from a tiny inline script that keeps your scroll position when you change the view, no
        JavaScript runs in your browser.
      </p>
      <p>
        Switch to <em>Web Workers</em> to move the work into your browser: the server only sends
        an empty canvas, and a pool of workers (one per CPU core) runs the very same{" "}
        <code>tracer.js</code>. Each worker traces one tile at a time and posts its pixels back,
        so the main thread stays free while all cores compute in parallel.
      </p>

      <section class="rt-studio" id="studio" aria-label="Ray tracer">
        <header class="rt-bar">
          <nav class="rt-pills" aria-label="Camera">
            <a href={link({ angle: view.angle - 30 })} title="Orbit left" aria-label="Orbit left">
              <Icon d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" />
            </a>
            <span>{view.angle}°</span>
            <a href={link({ angle: view.angle + 30 })} title="Orbit right" aria-label="Orbit right">
              <Icon d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" />
            </a>
          </nav>
          <nav class="rt-pills" aria-label="Quality">
            {QUALITY.map(({ samples, name }) => (
              <a
                href={link({ samples })}
                aria-current={view.samples === samples ? "page" : undefined}
              >
                {name}
              </a>
            ))}
          </nav>
          <nav class="rt-pills" aria-label="Rendered by">
            <a href={link({ browser: false })} aria-current={workers ? undefined : "page"}>
              Server
            </a>
            <a href={link({ browser: true })} aria-current={workers ? "page" : undefined}>
              Web Workers
            </a>
          </nav>
        </header>
        <KeepScroll />

        <div class="rt-progress" aria-hidden="true">
          <span></span>
        </div>

        <div
          class="rt-canvas"
          role="img"
          aria-label="Ray traced spheres on a checkered floor"
          style={`--columns: ${WIDTH / TILE}; --rows: ${HEIGHT / TILE}; aspect-ratio: ${WIDTH} / ${HEIGHT}`}
        >
          {workers ? (
            // Filled by the Web Workers, see index.js.
            <canvas
              class="rt-paint"
              width={WIDTH}
              height={HEIGHT}
              data-angle={view.angle}
              data-samples={view.samples}
            ></canvas>
          ) : (
            <Tiles view={view} />
          )}
        </div>

        <dl class="rt-hud">
          <div>
            <dt>Resolution</dt>
            <dd>
              {WIDTH}×{HEIGHT}
            </dd>
          </div>
          <div>
            <dt>Rays per pixel</dt>
            <dd>{view.samples * view.samples}</dd>
          </div>
          <div>
            <dt>Tiles</dt>
            <dd>{tiles().length}</dd>
          </div>
          <div>
            <dt>Rendered in</dt>
            <dd>
              <span class="rt-busy">tracing…</span>
              {!workers && <Done start={start} />}
            </dd>
          </div>
        </dl>
      </section>
    </Layout>
  );
}

/**
 * Traces the tiles in the shared pool of worker threads and yields each one as soon as it is
 * ready, in whatever order they finish. A request keeps at most one tile per thread in the
 * pool, so concurrent requests take turns instead of waiting for each other's whole image.
 */
async function* Tiles({ view }) {
  const list = tiles();
  /** @type {Map<number, Promise<{ key: number, column: number, row: number, png: string }>>} */
  const running = new Map();
  let next = 0;
  const submit = () => {
    const key = next;
    const { column, row } = list[next++];
    running.set(
      key,
      traceTile(view, column, row).then((png) => ({ key, column, row, png })),
    );
  };
  while (next < Math.min(THREADS, list.length)) submit();
  let done = 0;
  while (running.size) {
    const { key, column, row, png } = await Promise.race(running.values());
    running.delete(key);
    if (next < list.length) submit();
    done++;
    yield (
      <>
        <img
          src={`data:image/png;base64,${png}`}
          width={TILE}
          height={TILE}
          alt=""
          style={`grid-area: ${row + 1} / ${column + 1}`}
        />
        {/* Moves the progress bar, later rules win over earlier ones. */}
        {html(`<style>.rt-studio{--progress:${(done / list.length).toFixed(3)}}</style>`)}
      </>
    );
  }
}

function Done({ start }) {
  return (
    <span class="rt-done">
      {Date.now() - start} ms · {THREADS} threads
    </span>
  );
}

/**
 * Keeps the page where it was when a control is clicked. Without JavaScript, the "#studio"
 * anchor brings the reloaded page back to the image instead.
 *
 * Inline on purpose: it runs while the image is still streaming, unlike a module script,
 * which only runs once the whole page has arrived. Safari ignores a scroll position set
 * before its first layout, and the streaming document may still be too short for it, so the
 * position is reserved and applied on every frame until the page is loaded, unless the user
 * starts scrolling.
 */
function KeepScroll() {
  return html(`<script>
(() => {
  const key = "raytracer-scroll";
  document.querySelector(".rt-bar").addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    event.preventDefault();
    try {
      sessionStorage.setItem(key, String(scrollY));
    } catch {}
    location.href = link.href.split("#")[0];
  });
  let y = null;
  try {
    y = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
  } catch {}
  if (y === null) return;
  y = Number(y);
  const root = document.documentElement;
  root.style.minHeight = y + innerHeight + "px";
  let active = true;
  const events = ["wheel", "touchstart", "keydown"];
  const stop = () => {
    active = false;
    root.style.minHeight = "";
    events.forEach((type) => removeEventListener(type, stop));
  };
  events.forEach((type) => addEventListener(type, stop, { passive: true }));
  const apply = () => {
    if (!active) return;
    if (Math.abs(scrollY - y) > 1) scrollTo(0, y);
    requestAnimationFrame(apply);
  };
  apply();
  addEventListener("load", () => setTimeout(() => active && stop(), 100));
})();
</script>`);
}

/** A small stroked icon (24 × 24 grid), styled in index.css. */
function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
