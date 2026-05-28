import fs from "node:fs/promises";

const ASSET_PATHS = new Set(
  (
    await Promise.all([
      Array.fromAsync(fs.glob("**/*.*", { cwd: "public" })),
      Array.fromAsync(
        fs.glob("**/*.*", {
          cwd: "dist",
          exclude: (name) => /\[.*\]/.test(name),
        }),
      ),
    ])
  )
    .flat()
    .map((filepath) => `/${filepath}`),
);

/**
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  // Example for serving static assets from root guard.
  // Requires {"serve": false} for FastifyStaticOptions.
  if (ASSET_PATHS.has(request.path)) {
    return reply.sendFile(request.path);
  }
}
