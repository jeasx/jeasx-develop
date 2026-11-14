import createLoader from "./createLoader";

/**
 * @typedef {{
 *   name: string,
 *   version: string,
 *   description?: string,
 *   dependencies?: Record<string, string>,
 * }} Manifest
 *
 * @typedef {ReturnType<typeof createRegistry>} Registry
 */

/**
 * A loader for the npm registry: the nodes are the latest manifests of the
 * packages, their children are the dependencies.
 *
 * @param {AbortSignal} [signal] Aborts all requests, e.g. when the tree is replaced.
 */
export function createRegistry(signal) {
  return createLoader({
    /** @returns {Promise<Manifest>} */
    load: async (name, signal) => {
      const response = await fetch(
        `https://registry.npmjs.org/${name.replace("/", "%2F")}/latest`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    children: (manifest) => Object.keys(manifest.dependencies ?? {}).sort(),
    signal,
  });
}
