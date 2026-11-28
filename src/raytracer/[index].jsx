import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import { encodePng } from "./png";
import { HEIGHT, TILE, WIDTH, parseView, renderTile, tiles } from "./tracer";

const QUALITY = [
  { samples: 1, name: "Draft" },
  { samples: 2, name: "Good" },
  { samples: 4, name: "Best" },
  { samples: 6, name: "Cinematic" },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const view = parseView(/** @type {Record<string, string>} */ (request.query));
  const link = (change) => {
    const { angle, samples } = { ...view, ...change };
    // The anchor brings the reloaded page back to the image instead of the top.
    return `?angle=${angle}&samples=${samples}#studio`;
  };
  const start = Date.now();

  return (
    <Layout
      title="Live ray tracer"
      description="A ray tracer running on the server, streaming every finished tile as a PNG."
      css="/raytracer/index.css"
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
        An <code>async function*</code> component traces the image in {TILE}×{TILE} pixel tiles,
        spiralling outwards from the center. Every finished tile is encoded as a PNG with nothing
        but <code>node:zlib</code> and streamed right away as an <code>&lt;img&gt;</code> with a
        data URL. CSS grid puts each tile in place, no matter in which order it arrives. No
        JavaScript runs in your browser.
      </p>

      <section class="rt-studio" id="studio" aria-label="Ray tracer">
        <header class="rt-bar">
          <nav class="rt-pills" aria-label="Camera">
            <a href={link({ angle: view.angle - 30 })} title="Orbit left" aria-label="Orbit left">
              ↶
            </a>
            <span>{view.angle}°</span>
            <a href={link({ angle: view.angle + 30 })} title="Orbit right" aria-label="Orbit right">
              ↷
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
        </header>

        <div class="rt-progress" aria-hidden="true">
          <span></span>
        </div>

        <div
          class="rt-canvas"
          role="img"
          aria-label="Ray traced spheres on a checkered floor"
          style={`--columns: ${WIDTH / TILE}; --rows: ${HEIGHT / TILE}; aspect-ratio: ${WIDTH} / ${HEIGHT}`}
        >
          <Tiles view={view} />
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
              <Done start={start} />
            </dd>
          </div>
        </dl>
      </section>
    </Layout>
  );
}

/** Traces tile after tile and yields each one as soon as it is ready. */
async function* Tiles({ view }) {
  const list = tiles();
  let done = 0;
  for (const { column, row } of list) {
    // Tracing blocks the event loop, so give it a chance to flush the previous tile first.
    await new Promise((resolve) => setImmediate(resolve));
    const png = encodePng(renderTile(view, column * TILE, row * TILE), TILE, TILE);
    done++;
    yield (
      <>
        <img
          src={`data:image/png;base64,${png.toString("base64")}`}
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
  return <span class="rt-done">{Date.now() - start} ms</span>;
}
