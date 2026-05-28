import fs from "node:fs/promises";
import path from "node:path";

// Global cache for resolved asset paths
if (!globalThis.$filePathCache) {
  globalThis.$filePathCache = new Set();
}

/** @type Set<string> */
const cache = globalThis.$filePathCache;

/**
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  /*
    Serve static assets from root guard.
    Requires {"serve": false} for FastifyStaticOptions.
  */

  // Check if file exists
  if (!cache.has(request.path)) {
    for (const folder of ["dist", "public"]) {
      try {
        const filepath = path.join(process.cwd(), folder, request.path);
        if ((await fs.stat(filepath)).isFile()) {
          cache.add(request.path);
          break;
        }
      } catch {}
    }
  }

  // If path exists, serve asset
  if (cache.has(request.path)) {
    return reply.sendFile(request.path);
  }
}
