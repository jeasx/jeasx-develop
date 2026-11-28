// Loads the bundle of each card and shows its size in the badge of the card.

// Reuse the cache buster of this script (e.g. "?v=abc") for the bundles.
const VERSION = new URL(import.meta.url).search;

document.querySelectorAll(".fw-card[data-framework]").forEach(async (card) => {
  if (!(card instanceof HTMLElement)) return;
  // A path in a variable, so esbuild doesn't inline the bundle into this loader.
  const url = `/showdown/${card.dataset.framework}/index.js${VERSION}`;
  try {
    const module = await import(url);
    module.start(card.querySelector("[data-root]") ?? card);
    show(card, "[data-size]", kb(await measure(url)));
  } catch (error) {
    console.error(error);
    show(card, "[data-size]", "failed");
  }
});

/**
 * Returns the size of a bundle. Chromium often records no Resource Timing entry for module
 * scripts from its cache, then the bundle is read again from the cache and measured.
 *
 * @param {string} url
 */
async function measure(url) {
  const entry = /** @type {PerformanceResourceTiming | undefined} */ (
    performance.getEntriesByName(new URL(url, location.href).href)[0]
  );
  if (entry?.decodedBodySize) return entry.decodedBodySize;
  return (await (await fetch(url, { cache: "force-cache" })).blob()).size;
}

/** @param {number} bytes */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB JS`;
}

function show(card, selector, text) {
  const element = card.querySelector(selector);
  if (element) element.textContent = text;
}
