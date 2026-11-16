import { html, jsxToString } from "jsx-async-runtime";

/**
 * @typedef {object} FallbackInfo
 * @property {unknown} error The error of the last attempt.
 * @property {number} attempts How often the children were rendered.
 * @property {boolean} timedOut Whether the last attempt took longer than the timeout.
 */

/**
 * @typedef {object} BoundaryOptions
 * @property {JSX.Element | ((info: FallbackInfo) => JSX.Element)} [fallback]
 *   Rendered instead of the children if they fail; a function receives what went wrong.
 * @property {number} [timeout] Milliseconds per attempt before it counts as failed.
 * @property {number} [retries] How often to render the children again after a failure.
 * @property {(info: FallbackInfo) => void} [onError] Called for every failed attempt, e.g. to log it.
 */

/**
 * Renders children to a string, so errors (and timeouts) can be caught and replaced by a fallback.
 * Starts right away when called; to run several <ErrorBoundary> components at once,
 * wrap them in <Parallel>.
 *
 * JSX elements are only descriptions, so the children can simply be rendered again for a retry.
 * Each attempt gets its own `this` which inherits from the caller's context and adds
 * `this.signal`: it aborts on timeout, so components can stop waiting for their data.
 *
 * @this {object}
 * @param {JSX.Element} children
 * @param {BoundaryOptions} [options]
 * @returns {Promise<JSX.Element>}
 */
export async function catchErrors(children, options = {}) {
  const { fallback = null, timeout, retries = 0, onError } = options;
  /** @type {FallbackInfo} */
  let info = { error: undefined, attempts: 0, timedOut: false };
  while (info.attempts <= retries) {
    const controller = new AbortController();
    const context = Object.assign(Object.create(this ?? null), {
      signal: controller.signal,
    });
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;
    try {
      const rendered = jsxToString.call(context, children);
      const markup = await (timeout === undefined
        ? rendered
        : Promise.race([
            rendered,
            new Promise((_, reject) => {
              timer = setTimeout(() => {
                controller.abort(
                  new DOMException(`Took longer than ${timeout} ms.`, "TimeoutError"),
                );
                reject(controller.signal.reason);
              }, timeout);
            }),
          ]));
      // Strings returned by components are escaped, so mark the rendered markup as such.
      return html(markup);
    } catch (error) {
      info = {
        error,
        attempts: info.attempts + 1,
        timedOut: error instanceof DOMException && error.name === "TimeoutError",
      };
      onError?.(info);
    } finally {
      clearTimeout(timer);
      // Stop components of a failed attempt which are still waiting for data.
      controller.abort();
    }
  }
  return typeof fallback === "function" ? fallback(info) : fallback;
}

/**
 * The component form of catchErrors(): `<ErrorBoundary fallback={...}>...</ErrorBoundary>`.
 * Like all async components, it only starts once the elements before it have rendered,
 * unless it is wrapped in <Parallel>.
 *
 * @this {object}
 * @param {BoundaryOptions & { children: JSX.Element }} props
 */
export function ErrorBoundary(props) {
  const { children, ...options } = props;
  return catchErrors.call(this, children, options);
}
