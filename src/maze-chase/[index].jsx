import Layout from "../Layout";
import { initialState } from "./game";
import Hud from "./Hud";
import Maze from "./Maze";

export default function () {
  const state = initialState();
  return (
    <Layout
      title="Maze chase with client-side JSX"
      description="An arcade maze chase game rendered by JSX components in the browser with jsx-async-runtime."
      css="/maze-chase/index.css"
      script="/maze-chase/index.js"
    >
      <h1>Maze chase with client-side JSX</h1>
      <p>
        An arcade maze chase, built from plain JSX components with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. The server
        renders the first frame, then the very same components render every tick of the game in your
        browser, without React, a virtual DOM or a canvas. Help Blip the slime collect every gem,
        dodge the drones and grab a crystal to overload them, so you can zap them for a few seconds.
      </p>
      <div class="arcade">
        <section class="cabinet" id="game" tabindex="0" aria-label="Game">
          <div id="screen">
            <Hud state={state} best={0} />
            <Maze state={state} />
          </div>
        </section>
        <div class="pad" id="pad">
          <button type="button" class="key start" data-action="start">
            Start / Pause
          </button>
          <button type="button" class="key up" data-dir="up" aria-label="Up">
            ▲
          </button>
          <button type="button" class="key left" data-dir="left" aria-label="Left">
            ◀
          </button>
          <button type="button" class="key right" data-dir="right" aria-label="Right">
            ▶
          </button>
          <button type="button" class="key down" data-dir="down" aria-label="Down">
            ▼
          </button>
          <p class="help">
            Steer with the arrow keys or WASD, or swipe on the maze. Space starts and pauses the
            game.
          </p>
        </div>
      </div>
    </Layout>
  );
}
