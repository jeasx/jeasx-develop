import fs from "node:fs/promises";
import path from "node:path";

/**
 * @param {import("./types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  this.responseHandler = async (payload) => {
    if (reply.statusCode === 404) {
      if (!globalThis.$filePathCache) {
        globalThis.$filePathCache = new Set();
      }

      /** @type Set<string> */
      const cache = globalThis.$filePathCache;

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

      if (cache.has(request.path)) {
        reply.code(200);
        return reply.sendFile(request.path);
      }
    }

    return payload;
  };
}
