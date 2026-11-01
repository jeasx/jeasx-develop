/**
 * Maps a value from a domain (e.g. temperatures) to a range (e.g. pixels).
 *
 * @param {[number, number]} domain
 * @param {[number, number]} range
 */
export function scaleLinear([d0, d1], [r0, r1]) {
  return (/** @type {number} */ value) => r0 + ((value - d0) / (d1 - d0 || 1)) * (r1 - r0);
}

/**
 * Returns about `count` evenly spaced, round tick values (1, 2 or 5 times a power of ten)
 * which include min and max, e.g. [-5, 0, 5, 10, 15, 20, 25, 30] for -4.3 and 25.6.
 *
 * @param {number} min
 * @param {number} max
 * @param {number} [count]
 */
export function niceTicks(min, max, count = 5) {
  if (min === max) {
    max = min + 1;
  }
  const rough = (max - min) / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((step) => step >= rough);
  const ticks = [];
  for (let tick = Math.floor(min / step) * step; tick < max + step; tick += step) {
    // Avoid floating point noise like 0.30000000000000004.
    ticks.push(Number(tick.toPrecision(12)));
    if (tick >= max) {
      break;
    }
  }
  return ticks;
}

/**
 * Moves labels apart vertically, so they keep at least `gap` pixels between them.
 *
 * @template {{ y: number }} T
 * @param {T[]} labels
 * @param {number} gap
 * @returns {T[]}
 */
export function spreadLabels(labels, gap) {
  const sorted = labels.map((label) => ({ ...label })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    sorted[i].y = Math.max(sorted[i].y, sorted[i - 1].y + gap);
  }
  return sorted;
}
