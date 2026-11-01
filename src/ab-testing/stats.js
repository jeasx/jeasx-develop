// Counts views and conversions per variant in memory. The counts are lost on restart and
// differ between instances: a real app sends these events to an analytics service.

// Each route is bundled on its own, so the counts are kept on globalThis to share them.
// Sets of visitor ids count each visitor once, no matter how often they reload.
/** @type {{ views: Record<string, Set<string>>, conversions: Record<string, Set<string>> }} */
const stats = (globalThis.abTestingStats ??= {
  views: { A: new Set(), B: new Set() },
  conversions: { A: new Set(), B: new Set() },
});

// Limits keep a public demo from filling up the memory.
const MAX_VISITORS = 10000;

/**
 * @param {"views" | "conversions"} type
 * @param {string} variant
 * @param {string} visitor
 */
export function track(type, variant, visitor) {
  const set = stats[type][variant];
  // Only visitors who saw the page count as conversions, otherwise the rate could exceed 100%
  // (e.g. for direct posts to "/ab-testing/buy" or once the views reached MAX_VISITORS).
  if (type === "conversions" && !stats.views[variant]?.has(visitor)) {
    return;
  }
  if (set && set.size < MAX_VISITORS) {
    set.add(visitor);
  }
}

/** @param {string} variant */
export function results(variant) {
  const views = stats.views[variant]?.size ?? 0;
  const conversions = stats.conversions[variant]?.size ?? 0;
  return { views, conversions, rate: views ? (conversions / views) * 100 : 0 };
}
