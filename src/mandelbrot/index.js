import { HEIGHT, STRIP, WIDTH } from "./fractal";

// Click to zoom into a point by a factor of four, or drag a box to zoom into that area.
// Positions are measured relative to the displayed size of the image, so it works at any size.
const canvas = document.getElementById("canvas");

/** Drags shorter than this many pixels count as a click. */
const CLICK = 6;

/** Remembers the scroll position, the page restores it inline while it is streamed. */
function saveScroll() {
  try {
    sessionStorage.setItem("mandelbrot-scroll", String(scrollY));
  } catch {}
}

// The links to places and "Zoom out" keep the scroll position, too.
document.querySelectorAll("[data-keep-scroll]").forEach((link) => {
  link.addEventListener("click", saveScroll);
});

if (canvas) {
  const box = document.createElement("div");
  box.className = "mb-box";
  box.hidden = true;
  canvas.append(box);

  /** @type {{ x: number, y: number } | null} */
  let start = null;

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    canvas.setPointerCapture(event.pointerId);
    start = point(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!start) {
      return;
    }
    const end = point(event);
    Object.assign(box.style, {
      left: `${Math.min(start.x, end.x)}px`,
      top: `${Math.min(start.y, end.y)}px`,
      width: `${Math.abs(end.x - start.x)}px`,
      height: `${Math.abs(end.y - start.y)}px`,
    });
    box.hidden = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) < CLICK;
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!start) {
      return;
    }
    const end = point(event);
    const { width, height } = canvas.getBoundingClientRect();
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    const dragged = Math.max(w, h) >= CLICK;
    // A box zooms so that all of it stays visible, a click zooms in by four.
    const factor = dragged ? Math.min(width / w, height / h) : 4;
    zoomTo((start.x + end.x) / 2 / width, (start.y + end.y) / 2 / height, factor);
    start = null;
  });

  canvas.addEventListener("pointercancel", () => {
    start = null;
    box.hidden = true;
  });

  /** Reloads the page centered on a point given as fraction of the image size. */
  function zoomTo(fx, fy, factor) {
    const { x, y, zoom, span } = canvas.dataset;
    const { width, height } = canvas.getBoundingClientRect();
    saveScroll();
    const params = new URLSearchParams(location.search);
    params.set("x", String(Number(x) + (fx - 0.5) * Number(span)));
    params.set("y", String(Number(y) + ((fy - 0.5) * Number(span) * height) / width));
    params.set("zoom", String(Number(zoom) * factor));
    location.search = params.toString();
  }

  if (canvas.dataset.renderer === "browser") {
    renderInWorkers(canvas).catch((error) => {
      document.querySelector(".mb-time").textContent = `failed: ${error.message}`;
    });
  }
}

/** The preview is rendered at 1/PREVIEW of the final resolution, as on the server. */
const PREVIEW = 8;

/**
 * Fills the empty slots of the page with a pool of Web Workers, one per CPU core.
 * Every worker takes the next open task until none is left, so fast workers do more.
 * The preview comes first, then the strips from top to bottom.
 */
async function renderInWorkers(canvas) {
  const start = performance.now();
  const view = {
    x: Number(canvas.dataset.x),
    y: Number(canvas.dataset.y),
    zoom: Number(canvas.dataset.zoom),
  };
  const tasks = [
    {
      slot: canvas.querySelector('[data-slot="preview"]'),
      size: { width: WIDTH / PREVIEW, height: HEIGHT / PREVIEW },
      props: { class: "mb-preview", label: "Mandelbrot set" },
    },
    ...[...canvas.querySelectorAll(".mb-sharp [data-slot]")].map((slot) => ({
      slot,
      size: {
        width: WIDTH,
        height: HEIGHT,
        top: Number(slot.dataset.slot),
        rows: STRIP,
      },
    })),
  ];

  // The worker is bundled like every "index.*" file. Pass on the cache buster of this script.
  const url = new URL(`worker/index.js${new URL(import.meta.url).search}`, import.meta.url);
  const count = Math.min(navigator.hardwareConcurrency || 4, tasks.length);
  const explorer = canvas.closest(".mb-explorer");
  let next = 0;
  let done = 0;

  await Promise.all(
    Array.from({ length: count }, async () => {
      const worker = new Worker(url, { type: "module" });
      try {
        while (next < tasks.length) {
          const { slot, size, props } = tasks[next++];
          slot.outerHTML = await ask(worker, { view, size, props });
          // Strips arrive out of order, so progress counts the finished ones.
          explorer.style.setProperty("--progress", (++done / tasks.length).toFixed(3));
        }
      } finally {
        worker.terminate();
      }
    }),
  );

  const result = document.createElement("span");
  result.className = "mb-done";
  result.textContent = `${Math.round(performance.now() - start)} ms · ${count} workers`;
  document.querySelector(".mb-time").append(result);
}

/** Sends one task to a worker and resolves to its answer. */
function ask(worker, message) {
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => resolve(data);
    worker.onerror = (event) => reject(new Error(event.message || "worker failed"));
    worker.postMessage(message);
  });
}
