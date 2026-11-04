// Shows how long the browser waited for the first byte and for the complete page.
addEventListener("load", () => {
  const [navigation] = /** @type {PerformanceNavigationTiming[]} */ (
    performance.getEntriesByType("navigation")
  );
  if (!navigation) {
    return;
  }
  for (const [id, time] of [
    ["ttfb", navigation.responseStart],
    ["complete", navigation.responseEnd],
  ]) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = `${Math.round(time - navigation.requestStart)} ms`;
    }
  }
});
