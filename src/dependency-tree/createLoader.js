/**
 * Loads the nodes of a tree, e.g. packages and their dependencies. Each node is loaded
 * only once, even when it shows up in many places of the tree.
 *
 * jsx-async-runtime renders siblings in order: a component is only called once
 * the siblings before it are done. Awaiting each load inside its component
 * would therefore load a tree one node after the other. Instead, prefetch()
 * starts all loads of a subtree right away, and the components just await
 * promises that are already in flight.
 *
 * The loader is an EventTarget: it dispatches a "progress" event with
 * `{ requests, loaded }` as detail whenever a load starts or ends.
 *
 * @template T
 * @param {{
 *   load: (key: string, signal?: AbortSignal) => Promise<T>,
 *   children: (node: T) => string[],
 *   signal?: AbortSignal,
 * }} options `signal` aborts all loads, e.g. when the tree is replaced.
 */
export default function createLoader({ load, children, signal }) {
  /** @type {Map<string, Promise<T>>} */
  const cache = new Map();
  const stats = { requests: 0, loaded: 0 };
  const events = new EventTarget();
  const progress = () =>
    events.dispatchEvent(new CustomEvent("progress", { detail: { ...stats } }));

  /**
   * Returns the node for a key, loading it on first use.
   *
   * @param {string} key
   */
  function get(key) {
    let pending = cache.get(key);
    if (!pending) {
      stats.requests++;
      pending = load(key, signal).finally(() => {
        stats.loaded++;
        progress();
      });
      // Errors are rendered by the components; don't report them as unhandled here.
      pending.catch(() => {});
      cache.set(key, pending);
      progress();
    }
    return pending;
  }

  /**
   * Starts loading a node and, as soon as it has arrived, its children down to `depth`.
   * Keys in `ancestors` are skipped, so cycles end.
   *
   * @param {string} key
   * @param {number} depth
   * @param {string[]} [ancestors]
   */
  function prefetch(key, depth, ancestors = []) {
    if (ancestors.includes(key)) {
      return;
    }
    get(key).then(
      (node) => {
        if (depth > 0) {
          for (const child of children(node)) {
            prefetch(child, depth - 1, [...ancestors, key]);
          }
        }
      },
      () => {},
    );
  }

  return {
    get,
    prefetch,
    children,
    stats,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
}
