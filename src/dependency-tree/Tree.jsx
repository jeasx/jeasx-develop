import Package from "./Package";
import { createRegistry } from "./registry";

/** How many levels a new tree shows; deeper packages are loaded when opened. */
export const DEPTH = 1;

/**
 * Renders the dependency tree of a package with async components.
 *
 * @param {{
 *   name: string,
 *   where: string,
 *   depth?: number,
 *   registry?: import("./registry").Registry,
 * }} props
 */
export default function Tree({ name, where, depth = DEPTH, registry = createRegistry() }) {
  const started = performance.now();
  registry.prefetch(name, depth);
  return (
    <>
      <ul class="tree">
        <Package name={name} depth={depth} registry={registry} />
      </ul>
      {/* Siblings render in order, so this runs once the whole tree is done:
          pass the stats object, which is only read then. */}
      <Stats stats={registry.stats} started={started} where={where} />
    </>
  );
}

/** @param {{ stats: { requests: number }, started: number, where: string }} props */
function Stats({ stats, started, where }) {
  const { requests } = stats;
  const ms = Math.round(performance.now() - started);
  return (
    <p class="stats" data-requests={requests} data-ms={ms}>
      ✓ Rendered {where} from {requests} registry requests in {ms.toLocaleString("en-US")} ms.
    </p>
  );
}
