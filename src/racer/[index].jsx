import Layout from "../Layout";
import { initialState } from "./game";
import Hud from "./Hud";
import Road from "./Road";
import Sprites from "./Sprites";

export default function () {
  const state = initialState();
  return (
    <Layout
      title="Racer with client-side JSX"
      description="A pseudo-3D arcade racing game rendered as SVG by JSX components in the browser with jsx-async-runtime."
      css="/racer/index.css"
      script="/racer/index.js"
    >
      <h1>Racer with client-side JSX</h1>
      <p>
        A pseudo-3D arcade racer in the style of the eighties, built from plain JSX components with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. The server
        renders the starting grid, then the very same components project the road, hills, trees and
        traffic into an SVG for every animation frame in your browser, without React, a virtual DOM
        or a canvas. Race against the clock: every completed lap buys you more time.
      </p>
      <Sprites />
      <div class="track">
        <section class="cockpit" id="game" tabindex="0" aria-label="Game">
          <div id="screen">
            <Road state={state} />
            <Hud state={state} best={0} />
          </div>
        </section>
        <div class="pad" id="pad">
          <button type="button" class="key start" data-action="start">
            Start / Pause
          </button>
          <button type="button" class="key left" data-key="left" aria-label="Steer left">
            ◀
          </button>
          <button type="button" class="key right" data-key="right" aria-label="Steer right">
            ▶
          </button>
          <button type="button" class="key down" data-key="down">
            Brake
          </button>
          <button type="button" class="key up" data-key="up">
            Gas
          </button>
          <p class="help">
            Accelerate with ▲ or W, brake with ▼ or S and steer with ◀ ▶ or A D. Space starts and
            pauses the race. Stay on the asphalt: grass slows you down and trees stop you dead.
          </p>
        </div>
      </div>
    </Layout>
  );
}
