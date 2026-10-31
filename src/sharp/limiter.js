/** Thrown for a task which can't wait in line, as the line is full. */
export class QueueFullError extends Error {
  constructor() {
    super("Too many tasks are waiting.");
    this.name = "QueueFullError";
  }
}

/**
 * Creates a function which runs at most `max` tasks at the same time;
 * further tasks wait in line until a running task is finished.
 * If `maxWaiting` tasks are waiting already, further tasks are rejected
 * with a QueueFullError right away.
 * Each route bundles its own copy of this module, so each route has its own limit.
 *
 * @param {number} max
 * @param {number} [maxWaiting]
 */
export default function limiter(max, maxWaiting = Infinity) {
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
    } else if (waiting.length >= maxWaiting) {
      throw new QueueFullError();
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
