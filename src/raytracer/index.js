import { TILE, tiles } from "./tracer";

// With "Web Workers" selected, the server sends an empty canvas: trace the image here.
const paint = /** @type {HTMLCanvasElement | null} */ (document.querySelector(".rt-paint"));
if (paint) {
  renderInWorkers(paint).catch((error) => {
    const busy = document.querySelector(".rt-busy");
    if (busy) busy.textContent = `failed: ${error.message}`;
  });
}

/**
 * Traces all tiles with a pool of Web Workers, one per CPU core. Every worker takes the next
 * open tile until none is left, so fast workers do more. Tiles are handed out in the same
 * spiral order as on the server.
 * @param {HTMLCanvasElement} paint
 */
async function renderInWorkers(paint) {
  const start = performance.now();
  const view = { angle: Number(paint.dataset.angle), samples: Number(paint.dataset.samples) };
  const context = /** @type {CanvasRenderingContext2D} */ (paint.getContext("2d"));
  const studio = /** @type {HTMLElement} */ (document.querySelector(".rt-studio"));
  const list = tiles();
  // The worker is bundled like every "index.*" file. Pass on the cache buster of this script.
  const url = new URL(`worker/index.js${new URL(import.meta.url).search}`, import.meta.url);
  const count = Math.min(navigator.hardwareConcurrency || 4, list.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: count }, async () => {
      const worker = new Worker(url, { type: "module" });
      try {
        while (next < list.length) {
          const { column, row } = list[next++];
          const { rgba } = await ask(worker, { view, column, row });
          context.putImageData(new ImageData(rgba, TILE, TILE), column * TILE, row * TILE);
          studio.style.setProperty("--progress", String(++done / list.length));
        }
      } finally {
        worker.terminate();
      }
    }),
  );
  const result = document.createElement("span");
  result.className = "rt-done";
  result.textContent = `${Math.round(performance.now() - start)} ms · ${count} workers`;
  document.querySelector(".rt-busy")?.after(result);
}

/** Sends one tile to a worker and resolves to its answer. */
function ask(worker, message) {
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => resolve(data);
    worker.onerror = (event) => reject(new Error(event.message || "worker failed"));
    worker.postMessage(message);
  });
}
