import { availableParallelism } from "node:os";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { encodePng } from "./png";
import { TILE, renderTile } from "./tracer";

/**
 * A pool of worker threads, one per CPU core, shared by all requests. Tracing blocks a
 * thread for a while; in the pool, all cores trace in parallel and the main thread stays free
 * to answer other requests.
 *
 * Jeasx bundles this file into the route, so a worker thread simply starts the bundled route
 * again. Then this module sees it is not on the main thread and answers tile requests.
 */

if (!isMainThread && workerData?.role === "raytracer") {
  parentPort?.on("message", ({ id, view, column, row }) => {
    const png = encodePng(renderTile(view, column * TILE, row * TILE), TILE, TILE);
    parentPort?.postMessage({ id, png: png.toString("base64") });
  });
}

/** Number of threads, and how many tiles one request may have in the pool at once. */
export const THREADS = availableParallelism();

// Kept on globalThis: in development, Jeasx reloads changed routes as new modules. A pool
// started by an older version of this file is shut down instead of leaking its threads.
const KEY = Symbol.for("jeasx-expo.raytracer.pool");

/**
 * @typedef {{ angle: number, samples: number }} View
 * @typedef {{ id: number, view: View, column: number, row: number,
 *   resolve: (png: string) => void, reject: (error: unknown) => void }} Task
 * @type {{ url: string, idle: Worker[], queue: Task[], pending: Map<number, Task> }}
 */
let pool = globalThis[KEY];
if (pool?.url !== import.meta.url) {
  pool?.idle.forEach((worker) => worker.terminate());
  pool = globalThis[KEY] = { url: import.meta.url, idle: [], queue: [], pending: new Map() };
}

let started = false;
let nextId = 0;

/** Starts the threads on first use, so the server boots without them. */
function start() {
  if (started) return;
  started = true;
  for (let i = 0; i < THREADS; i++) {
    const worker = new Worker(new URL(import.meta.url), { workerData: { role: "raytracer" } });
    // Idle threads must not keep the process alive on shutdown.
    worker.unref();
    worker.on("message", ({ id, png }) => {
      pool.pending.get(id)?.resolve(png);
      pool.pending.delete(id);
      pool.idle.push(worker);
      dispatch();
    });
    worker.on("error", (error) => {
      for (const task of pool.pending.values()) task.reject(error);
      pool.pending.clear();
    });
    pool.idle.push(worker);
  }
}

/** Hands queued tiles to idle threads, first come, first served. */
function dispatch() {
  while (pool.idle.length && pool.queue.length) {
    const worker = /** @type {Worker} */ (pool.idle.pop());
    const task = /** @type {Task} */ (pool.queue.shift());
    pool.pending.set(task.id, task);
    worker.postMessage({ id: task.id, view: task.view, column: task.column, row: task.row });
  }
}

/**
 * Traces one tile in the pool and resolves to the tile as base64 PNG.
 * @param {View} view
 * @param {number} column
 * @param {number} row
 * @returns {Promise<string>}
 */
export function traceTile(view, column, row) {
  start();
  return new Promise((resolve, reject) => {
    pool.queue.push({ id: nextId++, view, column, row, resolve, reject });
    dispatch();
  });
}
