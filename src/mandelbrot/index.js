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
    if (event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    start = point(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!start) return;
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
    if (!start) return;
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
    location.search = new URLSearchParams({
      x: String(Number(x) + (fx - 0.5) * Number(span)),
      y: String(Number(y) + ((fy - 0.5) * Number(span) * height) / width),
      zoom: String(Number(zoom) * factor),
    }).toString();
  }
}
