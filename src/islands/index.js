// The island loader: the only script every visitor downloads.
// It decides per island when to load its framework bundle and hands over the markup.

// Reuse the cache buster of this script (e.g. "?v=abc") for the framework bundles.
const VERSION = new URL(import.meta.url).search;

/** One bundle per framework, loaded at most once and shared by all its islands. */
const bundles = new Map();

function loadBundle(framework) {
  if (!bundles.has(framework)) {
    // A path in a variable, so esbuild doesn't inline the bundle into this loader.
    const url = `/islands/${framework}/index.js${VERSION}`;
    bundles.set(
      framework,
      import(url).then((module) => ({ module, url })),
    );
  }
  return bundles.get(framework);
}

/** Waits for the moment the strategy of an island asks for. */
const STRATEGIES = {
  load: () => Promise.resolve(),
  idle: () =>
    new Promise((/** @type {(value?: unknown) => void} */ resolve) =>
      "requestIdleCallback" in window
        ? requestIdleCallback(() => resolve())
        : setTimeout(resolve, 200),
    ),
  visible: (island) =>
    new Promise((/** @type {(value?: unknown) => void} */ resolve) => {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(island);
    }),
  interaction: (island) =>
    new Promise((/** @type {(value?: unknown) => void} */ resolve) => {
      const events = ["pointerenter", "focusin", "touchstart"];
      const handler = () => {
        events.forEach((name) => island.removeEventListener(name, handler));
        resolve();
      };
      events.forEach((name) => island.addEventListener(name, handler, { passive: true }));
    }),
};

const totals = { bundles: new Set(), bytes: 0, transferred: 0 };

async function hydrateIsland(island) {
  const { framework, hydrate } = island.dataset;
  const root = island.querySelector(".island-root");
  const strategy = STRATEGIES[hydrate];
  if (!(root instanceof HTMLElement) || !strategy) return;

  setStatus(island, "waiting", hydrate === "load" ? "loading…" : `waiting for ${hydrate}`);
  await strategy(island);

  setStatus(island, "loading", "loading JS…");
  const start = performance.now();
  try {
    const { module, url } = await loadBundle(framework);
    const props = root.dataset.props ? JSON.parse(root.dataset.props) : {};
    await module.hydrate(root, root.dataset.component, props);
    const ms = Math.round(performance.now() - start);
    setStatus(island, "hydrated", `hydrated in ${ms} ms`);
    countBundle(framework, url);
    addToTimeline(framework, root.dataset.component, hydrate);
  } catch (error) {
    console.error(error);
    setStatus(island, "failed", "failed, still usable as HTML");
  }
}

function setStatus(island, state, text) {
  island.dataset.state = state;
  const status = island.querySelector(".island-status");
  if (status) status.textContent = text;
}

/**
 * Returns the size of a bundle and how many bytes went over the network (0 if it came from the cache).
 * Resource Timing reports a transferSize of 0 for cached responses, and Chromium often records no
 * entry at all for module scripts from its memory cache. Then the bundle is read again from the
 * cache ("force-cache" never goes to the network for a cached response) and measured.
 *
 * @param {string} url
 */
async function measureBundle(url) {
  const entry = /** @type {PerformanceResourceTiming | undefined} */ (
    performance.getEntriesByName(new URL(url, location.href).href)[0]
  );
  const transferred = entry?.transferSize ?? 0;
  let size = entry?.decodedBodySize ?? 0;
  if (!size) {
    try {
      size = (await (await fetch(url, { cache: "force-cache" })).blob()).size;
    } catch {
      size = 0;
    }
  }
  return { size, transferred };
}

/** Adds the size of a bundle to its chip and the total, once per bundle. */
async function countBundle(framework, url) {
  if (totals.bundles.has(url)) return;
  totals.bundles.add(url);
  const { size, transferred } = await measureBundle(url);
  totals.bytes += size;
  totals.transferred += transferred;
  const chip = document.querySelector(`[data-chip="${framework}"]`);
  if (chip instanceof HTMLElement) {
    chip.dataset.loaded = "";
    const label = chip.querySelector("[data-size]");
    // A cached bundle transfers nothing, or only headers when the browser revalidates it (304).
    const cached = transferred < Math.min(size, 2048);
    if (label) label.textContent = `${kb(size)}${cached ? " · cached" : ""}`;
  }
  const summary = document.querySelector("[data-summary]");
  if (summary) {
    summary.textContent = `${kb(totals.bytes)} of JavaScript (${kb(totals.transferred)} over the network), ${totals.bundles.size} of 4 frameworks`;
  }
}

/** @param {number} bytes */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/** Adds an entry to the timeline: when, since navigation, an island was hydrated. */
function addToTimeline(framework, component, hydrate) {
  const timeline = document.querySelector("[data-timeline]");
  if (!timeline) return;
  const item = document.createElement("li");
  item.dataset.framework = framework;
  const time = document.createElement("time");
  time.textContent = `+${(performance.now() / 1000).toFixed(2)}s`;
  item.append(time, ` ${component} `);
  const strategy = document.createElement("small");
  strategy.textContent = hydrate;
  item.append(strategy);
  timeline.append(item);
}

document.querySelectorAll(".island[data-hydrate]").forEach((island) => {
  if (island instanceof HTMLElement && island.dataset.hydrate !== "none") {
    hydrateIsland(island);
  }
});
