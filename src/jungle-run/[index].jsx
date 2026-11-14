import Layout from "../Layout";
import { initialState } from "./game";
import Hud from "./Hud";
import Scene, { Defs } from "./Scene";

export default function () {
  const state = initialState();
  return (
    <Layout
      title="Jungle run with client-side JSX"
      description="A side-scrolling jungle adventure rendered as SVG by JSX components in the browser with jsx-async-runtime."
      css="/jungle-run/index.css"
      script="/jungle-run/index.js"
    >
      <h1>Jungle run with client-side JSX</h1>
      <p>
        A side-scrolling jungle adventure in the style of the eighties, built from plain JSX
        components with <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>.
        The server renders the first clearing, then the very same components draw trees, vines,
        crocodiles, rolling logs and scorpions into an SVG for every animation frame in your
        browser, without React, a virtual DOM or a canvas. Find every treasure in the ring of 32
        screens before the time runs out.
      </p>
      <Defs />
      <div class="track">
        <section class="frame" id="game" tabindex="0" aria-label="Game">
          <div id="screen">
            <Scene state={state} />
            <Hud state={state} best={0} />
          </div>
        </section>
        <div class="pad" id="pad">
          <button type="button" class="key start" data-action="start">
            Start / Pause
          </button>
          <button type="button" class="key up" data-key="up" aria-label="Climb up">
            ▲
          </button>
          <button type="button" class="key left" data-key="left" aria-label="Run left">
            ◀
          </button>
          <button type="button" class="key right" data-key="right" aria-label="Run right">
            ▶
          </button>
          <button type="button" class="key down" data-key="down" aria-label="Let go">
            ▼
          </button>
          <button type="button" class="key jump" data-key="jump">
            Jump
          </button>
          <p class="help">
            Run with ◀ ▶ or A D and jump with Space. Jump at a vine to grab it, and jump again or
            press ▼ to let go. Climb ladders with ▲ ▼. Enter starts and pauses. Crocodiles bite when
            their mouths are open, and rolling logs cost points.
          </p>
        </div>
      </div>
    </Layout>
  );
}
