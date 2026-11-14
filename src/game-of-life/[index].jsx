import Layout from "../Layout";
import Board from "./Board";
import { initialCells } from "./life";
import Stats from "./Stats";

export default function () {
  const cells = initialCells();
  return (
    <Layout
      title="Game of Life with client-side JSX"
      description="Conway's Game of Life rendered by JSX components in the browser with jsx-async-runtime."
      css="/game-of-life/index.css"
      script="/game-of-life/index.js"
    >
      <h1>Game of Life with client-side JSX</h1>
      <p>
        Conway's Game of Life, built from plain JSX components with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. The server
        renders the first generation, then the very same components render every following
        generation in your browser, without React, a virtual DOM or hydration. Hold the mouse button
        and drag to paint cells.
      </p>
      <div class="playground">
        <section class="lab">
          <div class="controls" id="controls">
            <button class="control primary" type="button" data-action="play">
              ▶ Play
            </button>
            <button class="control" type="button" data-action="step">
              ⏭ Step
            </button>
            <button class="control" type="button" data-action="random">
              🎲 Random
            </button>
            <button class="control" type="button" data-action="clear">
              ✕ Clear
            </button>
            <label class="speed">
              Speed
              <input type="range" name="speed" min="1" max="30" value="10" />
            </label>
          </div>
          <div id="life">
            <Board cells={cells} />
            <Stats generation={0} history={[cells.filter(Boolean).length]} />
          </div>
        </section>
        <ul class="rules">
          <li class="birth">
            <strong>Birth</strong> A dead cell with exactly three live neighbors comes to life.
          </li>
          <li class="survival">
            <strong>Survival</strong> A live cell with two or three live neighbors stays alive.
          </li>
          <li class="death">
            <strong>Death</strong> Every other cell dies of loneliness or overcrowding.
          </li>
        </ul>
      </div>
    </Layout>
  );
}
