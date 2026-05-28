import fs from "node:fs/promises";
import path from "node:path";

const CWD = process.cwd();
const STATIC_PATH_CACHE = new Map();

/**
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  // Example for serving static assets from root guard.
  // Requires {"serve": false} for FastifyStaticOptions.

  if (!request.path.endsWith("/")) {
    // Check if file exists
    if (!STATIC_PATH_CACHE.has(request.path)) {
      let isFile = false;
      for (const folder of ["dist", "public"]) {
        try {
          const filepath = path.join(CWD, folder, request.path);
          if ((await fs.stat(filepath)).isFile()) {
            isFile = true;
            break;
          }
        } catch {}
      }
      STATIC_PATH_CACHE.set(request.path, isFile);
    }

    // If path exists, serve asset
    if (STATIC_PATH_CACHE.get(request.path)) {
      return reply.sendFile(request.path);
    }
  }
}
