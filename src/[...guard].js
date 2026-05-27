import fs from "node:fs/promises";
import path from "node:path";

if (!globalThis.assetPathCache) {
  globalThis.assetPathCache = new Set();
}

/** @type Set<string> */
const assetPathCache = globalThis.assetPathCache;

/**
 * @param {import("./types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  this.responseHandler = async (payload) => {
    if (reply.statusCode === 404) {
      if (!assetPathCache.has(request.path)) {
        for (const prefix of ["dist", "public"]) {
          try {
            await fs.access(path.join(process.cwd(), prefix, request.path), fs.constants.R_OK);
            assetPathCache.add(request.path);
            break;
          } catch {}
        }
      }
      if (assetPathCache.has(request.path)) {
        reply.code(200);
        return reply.sendFile(request.path);
      }
    }

    return payload;
  };
}
