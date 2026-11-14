import { COLS } from "./life";

/**
 * Renders the board. The same component runs on the server for the first
 * paint and in the browser for every following generation. With the previous
 * generation, cells born in this step glow brighter and cells that just died
 * leave a fading trail.
 *
 * @param {{ cells: boolean[], previous?: boolean[] }} props
 */
export default function Board({ cells, previous = cells }) {
  return (
    <div class="board" style={`--cols: ${COLS}`}>
      {cells.map((alive, index) => (
        <button
          type="button"
          class={[
            "cell",
            alive && "alive",
            alive && !previous[index] && "born",
            !alive && previous[index] && "dying",
          ]
            .filter(Boolean)
            .join(" ")}
          data-index={index}
          aria-label={`Cell ${(index % COLS) + 1}, ${Math.floor(index / COLS) + 1}`}
          aria-pressed={alive ? "true" : "false"}
        />
      ))}
    </div>
  );
}
