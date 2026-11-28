import { TILE, renderTile } from "../tracer";

/**
 * A Web Worker that traces one tile per message. It runs the same tracer.js as the server
 * and posts the pixels back as RGBA, ready for the canvas. The buffer is transferred, not
 * copied.
 *
 * Message: `{ view, column, row }`
 * Answer:  `{ column, row, rgba }`
 */
self.addEventListener("message", ({ data: { view, column, row } }) => {
  const rgb = renderTile(view, column * TILE, row * TILE);
  const rgba = new Uint8ClampedArray(TILE * TILE * 4);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    rgba[j] = rgb[i];
    rgba[j + 1] = rgb[i + 1];
    rgba[j + 2] = rgb[i + 2];
    rgba[j + 3] = 255;
  }
  postMessage({ column, row, rgba }, { transfer: [rgba.buffer] });
});
