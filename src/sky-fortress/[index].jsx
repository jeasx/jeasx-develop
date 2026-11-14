import Layout from "../Layout";
import { initialState } from "./game";
import Hud from "./Hud";
import Scene, { Defs } from "./Scene";

export default function () {
  const state = initialState();
  return (
    <Layout
      title="Sky fortress with client-side JSX"
      description="An isometric arcade shooter rendered as SVG by JSX components in the browser with jsx-async-runtime."
      css="/sky-fortress/index.css"
      script="/sky-fortress/index.js"
    >
      <h1>Sky fortress with client-side JSX</h1>
      <p>
        An isometric arcade shooter in the style of the eighties, built from plain JSX components
        with <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. The server
        renders the approach to the fortress, then the very same components project walls, turrets,
        fighters and flak into an SVG for every animation frame in your browser, without React, a
        virtual DOM or a canvas. Watch your shadow and the altimeter to judge your height, and shoot
        fuel tanks before your tank runs dry.
      </p>
      <Defs />
      <div class="track">
        <section class="cockpit" id="game" tabindex="0" aria-label="Game">
          <div id="screen">
            <Scene state={state} />
            <Hud state={state} best={0} />
          </div>
        </section>
        <div class="pad" id="pad">
          <button type="button" class="key start" data-action="start">
            Start / Pause
          </button>
          <button type="button" class="key up" data-key="up" aria-label="Climb">
            ▲
          </button>
          <button type="button" class="key left" data-key="left" aria-label="Left">
            ◀
          </button>
          <button type="button" class="key right" data-key="right" aria-label="Right">
            ▶
          </button>
          <button type="button" class="key down" data-key="down" aria-label="Dive">
            ▼
          </button>
          <button type="button" class="key fire" data-key="fire">
            Fire
          </button>
          <p class="help">
            Climb and dive with ▲ ▼ or W S, move sideways with ◀ ▶ or A D and fire with Space. Enter
            starts and pauses. Fly through the gates in the walls or high above them.
          </p>
        </div>
      </div>
    </Layout>
  );
}
