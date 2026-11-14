/**
 * The live panel in the sidebar: packages loaded, elapsed time and a progress
 * bar. It listens to the progress events of a loader, so the loader doesn't
 * know anything about the page.
 *
 * @param {HTMLElement} panel
 */
export default function livePanel(panel) {
  const status = panel.querySelector("#live-status");
  const loaded = panel.querySelector("#live-loaded");
  const ms = panel.querySelector("#live-ms");
  const bar = /** @type {HTMLElement} */ (panel.querySelector("#live-bar"));
  /** When the current load started, or null while idle. */
  let started = null;

  /**
   * @param {"idle" | "loading"} state
   * @param {string} text
   */
  function setStatus(state, text) {
    panel.dataset.state = state;
    status.textContent = text;
  }

  function startTimer() {
    if (started !== null) {
      return;
    }
    started = performance.now();
    setStatus("loading", "Streaming…");
    const tick = () => {
      if (started === null) {
        return;
      }
      ms.textContent = Math.round(performance.now() - started).toLocaleString("en-US");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return {
    /**
     * Shows the numbers of a tree rendered on the server.
     *
     * @param {HTMLElement | null} stats The stats line of the tree.
     */
    showServerStats(stats) {
      if (stats) {
        loaded.textContent = stats.dataset.requests;
        ms.textContent = Number(stats.dataset.ms).toLocaleString("en-US");
        bar.style.width = "100%";
      }
    },

    /** Clears the numbers and starts the timer for a new tree. */
    reset() {
      started = null;
      loaded.textContent = "0";
      bar.style.width = "0";
      startTimer();
    },

    /**
     * Follows the progress of a loader until the signal is aborted.
     *
     * @param {ReturnType<typeof import("./createLoader").default>} loader
     * @param {AbortSignal} signal
     */
    track(loader, signal) {
      loader.addEventListener(
        "progress",
        (/** @type {CustomEvent} */ event) => {
          const { requests, loaded: done } = event.detail;
          loaded.textContent = String(done);
          bar.style.width = `${(done / requests) * 100}%`;
          if (done < requests) {
            startTimer();
          } else {
            setStatus("idle", "Rendered in your browser");
            started = null;
          }
        },
        { signal },
      );
    },
  };
}
