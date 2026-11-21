// Starts loading a little before an element scrolls into view.
const observer = new IntersectionObserver(
  (entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) {
        continue;
      }
      observer.unobserve(target);
      load(/** @type {HTMLElement} */ (target));
    }
  },
  { rootMargin: "200px" },
);

/**
 * Fetches the HTML of an element and puts it into its light DOM. setHTMLUnsafe (unlike innerHTML)
 * parses <template shadowrootmode>, so the card arrives with its shadow root attached.
 *
 * @param {HTMLElement} element
 */
async function load(element) {
  meter.update(element, "loading");
  try {
    const response = await fetch(element.getAttribute("src"));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    element.setHTMLUnsafe(await response.text());
    const card = element.querySelector("widget-card");
    // The badge class tells sync from async; data-failed marks the error card.
    const kind = card?.shadowRoot?.querySelector("article")?.className;
    meter.update(element, card?.hasAttribute("data-failed") ? "failed" : kind || "async");
  } catch (error) {
    element.textContent = `Loading failed: ${error.message}`;
    meter.update(element, "failed");
  } finally {
    element.removeAttribute("aria-busy");
  }
}

/**
 * The floating panel: one dot per widget, colored by its state.
 * Purely decorative for the demo, the page works without it.
 */
const meter = (() => {
  const panel = /** @type {HTMLElement | null} */ (document.querySelector(".lazy-meter"));
  const widgets = [...document.querySelectorAll("lazy-load")];
  /** @type {Map<Element, HTMLSpanElement>} */
  const dots = new Map();
  if (panel && widgets.length > 0) {
    const container = panel.querySelector(".lazy-meter-dots");
    widgets.forEach((widget) => {
      const dot = document.createElement("span");
      dot.dataset.state = "waiting";
      container.append(dot);
      dots.set(widget, dot);
    });
    panel.querySelector("span").textContent = String(widgets.length);
    panel.hidden = false;
  }
  return {
    /**
     * @param {Element} widget
     * @param {string} state
     */
    update(widget, state) {
      const dot = dots.get(widget);
      if (!dot) {
        return;
      }
      dot.dataset.state = state;
      const done = [...dots.values()].filter(
        (d) => d.dataset.state !== "waiting" && d.dataset.state !== "loading",
      ).length;
      panel.querySelector("output").value = String(done);
    },
  };
})();

customElements.define(
  "lazy-load",
  class extends HTMLElement {
    connectedCallback() {
      observer.observe(this);
    }
    disconnectedCallback() {
      observer.unobserve(this);
    }
  },
);
