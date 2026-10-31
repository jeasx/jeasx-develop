/**
 * Creates a function which runs at most `max` tasks at the same time;
 * further tasks wait in line until a running task is finished.
 * Each route bundles its own copy of this module, so each route has its own limit.
 *
 * @param {number} max
 */
export default function limiter(max) {
  let running = 0;
  /** @type {(() => void)[]} */
  const waiting = [];

  /**
   * @template T
   * @param {() => Promise<T>} task
   * @returns {Promise<T>}
   */
  return async function limit(task) {
    if (running < max) {
      running++;
    } else {
      // Wait until a finished task hands over its slot.
      await new Promise((resolve) => waiting.push(() => resolve(undefined)));
    }
    try {
      return await task();
    } finally {
      const next = waiting.shift();
      if (next) {
        next();
      } else {
        running--;
      }
    }
  };
}
