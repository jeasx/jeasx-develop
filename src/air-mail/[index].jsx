import Layout from "../Layout";
import Actors from "./Actors";
import Chunk, { TerrainDefs } from "./Chunk";
import { daySeed } from "./course";
import { initialState } from "./game";
import Hud from "./Hud";
import { FIRST_CHUNKS, HEIGHT, PLANE_X, WIDTH } from "./shared";
import Sky from "./Sky";
import StreamInfo from "./StreamInfo";

export default function () {
  const state = initialState();
  const seed = daySeed();
  const day = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const camera = state.x - PLANE_X;
  return (
    <Layout
      title="Air mail with streamed JSX"
      description="A side-scrolling flight game: the server streams the landscape as JSX while the browser renders the plane with jsx-async-runtime."
      css="/air-mail/index.css"
      script="/air-mail/index.js"
    >
      <h1>Air mail with streamed JSX</h1>
      <p>
        A bush plane delivers mail across a landscape that the server and the browser render
        together with <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>.
        The server renders mountains, forests, lakes, villages and airstrips as JSX and streams them
        chunk by chunk over a single response while you fly. Thanks to backpressure, it only renders
        the next chunk when your browser reads on. Meanwhile the browser renders the sky, the plane,
        the parcels and the instruments for every animation frame. The course changes every day and
        is the same for everyone.
      </p>
      <TerrainDefs />
      <div class="track">
        <div class="display">
          <section
            class="cockpit"
            id="game"
            tabindex="0"
            aria-label="Game"
            data-seed={seed}
            data-day={day}
          >
            <div id="screen">
              <svg
                id="sky"
                class="layer"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
              >
                <Sky camera={camera} clock={0} />
              </svg>
              <svg
                class="layer"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
              >
                <g id="terrain" transform={`translate(${-camera} 0)`}>
                  {Array.from({ length: FIRST_CHUNKS }, (_, index) => (
                    <Chunk seed={seed} index={index} />
                  ))}
                </g>
              </svg>
              <div id="actors" class="layer">
                <Actors state={state} />
                <Hud state={state} best={0} day={day} />
              </div>
            </div>
          </section>
          {/* Rendered again by the browser as chunks of the course arrive. */}
          <div class="stream" id="stream">
            <StreamInfo
              status="page"
              request={`GET course?seed=${seed}&from=${FIRST_CHUNKS}`}
              first={0}
              last={FIRST_CHUNKS - 1}
            />
          </div>
        </div>
        <div class="pad" id="pad">
          <button type="button" class="key start" data-action="start">
            Start / Pause
          </button>
          <button type="button" class="key up" data-key="up" aria-label="Climb">
            ▲
          </button>
          <button type="button" class="key left" data-key="left" aria-label="Slower">
            ◀
          </button>
          <button type="button" class="key right" data-key="right" aria-label="Faster">
            ▶
          </button>
          <button type="button" class="key down" data-key="down" aria-label="Dive">
            ▼
          </button>
          <button type="button" class="key drop" data-key="drop">
            Drop
          </button>
          <p class="help">
            Climb and dive with ▲ ▼ or W S, slow down and speed up with ◀ ▶ or A D, and drop mail
            with Space onto the targets in the villages. Land gently on airstrips to refuel and load
            new mail. Enter starts and pauses.
          </p>
        </div>
      </div>
    </Layout>
  );
}
