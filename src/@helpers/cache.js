/**
 * Creates a cache for the results of slow calls, e.g. to remote APIs.
 * Calls for the same key share one pending promise, so a burst of requests loads only once.
 * Results of undefined and rejected promises aren't kept, so the next call tries again.
 * Each route bundles its own copy of this module, so routes don't share their entries.
 *
 * @param {{ ttl: number, max?: number }} options Time to live in milliseconds and maximum entries.
 */
export default function cache({ ttl, max = 100 }) {
  /** @type {Map<string, { expires: number, promise: Promise<any> }>} */
  const entries = new Map();

  /**
   * @template T
   * @param {string} key
   * @param {() => Promise<T>} load
   * @returns {Promise<T>}
   */
  return function cached(key, load) {
    const entry = entries.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.promise;
    }
    entries.delete(key);

    const promise = load();
    entries.set(key, { expires: Date.now() + ttl, promise });
    if (entries.size > max) {
      // The oldest entry comes first.
      entries.delete(entries.keys().next().value);
    }

    const forget = () => {
      if (entries.get(key)?.promise === promise) {
        entries.delete(key);
      }
    };
    promise.then((value) => value === undefined && forget(), forget);
    return promise;
  };
}
