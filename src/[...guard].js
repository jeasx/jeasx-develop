// import { glob } from "node:fs/promises";

// const ASSET_PATHS = new Set(
//   (
//     await Array.fromAsync(glob("{dist,public}/**/*.*", { exclude: (name) => /\[.*\]/.test(name) }))
//   ).map((filepath) => filepath.replace(/^(dist|public)/, "").replaceAll("\\", "/")),
// );

/**
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Prepare "this" context
  this.request = request;
  this.reply = reply;

  // Example for serving static assets from responseHandler.
  // Requires {"serve": false} for FastifyStaticOptions.
  // this.responseHandler = (payload) => {
  //   if (reply.statusCode === 404) {
  //     if (ASSET_PATHS.has(request.path)) {
  //       reply.status(200);
  //       return reply.sendFile(request.path);
  //     }
  //   }
  //   return payload;
  // };
}
