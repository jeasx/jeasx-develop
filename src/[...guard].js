import fs from "node:fs/promises";
import path from "node:path";

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

  // Global cache for resolved asset paths
  if (!globalThis.$filePathCache) {
    globalThis.$filePathCache = new Set();
  }

  /** @type Set<string> */
  const cache = globalThis.$filePathCache;

  // Check if file exists
  if (!cache.has(request.path)) {
    for (const folder of ["dist", "public"]) {
      try {
        const filepath = path.join(process.cwd(), folder, request.path);
        await fs.access(filepath, fs.constants.R_OK);
        cache.add(request.path);
        break;
      } catch {}
    }
  }

  // If path exists, serve asset
  if (cache.has(request.path)) {
    reply.code(200);
    return reply.sendFile(request.path);
  }
}
