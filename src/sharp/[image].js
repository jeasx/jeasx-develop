import { stat } from "node:fs/promises";
import { join, sep } from "node:path";
import sharp from "sharp";

const LOCAL_IMAGE_DIR = join(process.cwd(), "public", "images");
const ALLOWED_REMOTE_HOSTS = ["cdn.dummyjson.com"];
const MAX_DIMENSION = 4000;
const POSITIONS = new Set([
  ...Object.keys(sharp.strategy),
  ...Object.keys(sharp.gravity),
  "top",
  "right",
  "bottom",
  "left",
  "right top",
  "right bottom",
  "left bottom",
  "left top",
]);

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const query = /** @type {Record<string, string | undefined>} */ (request.query);

  const input = await loadImage(query["src"]);
  if (!input) {
    return;
  }

  const position = query["position"] || undefined;
  if (position && !POSITIONS.has(position)) {
    return;
  }

  const accept = request.headers.accept ?? "";
  const format = accept.includes("image/avif")
    ? "avif"
    : accept.includes("image/webp")
      ? "webp"
      : "jpeg";

  const image = await sharp(input)
    .resize({
      width: toDimension(query["width"]),
      height: toDimension(query["height"]),
      position,
    })
    .toFormat(format, { quality: 70 })
    .toBuffer();

  reply.type(`image/${format}`);
  // The format depends on the Accept header, so caches must store one copy per value.
  reply.header("vary", "accept");
  reply.header("cache-control", "public, max-age=31536000, s-maxage=31536000, immutable");
  return image;
}

/**
 * Returns a local file path or the bytes of a remote image,
 * or undefined if the source isn't allowed or can't be loaded.
 *
 * @param {string | undefined} src
 */
async function loadImage(src) {
  if (typeof src !== "string" || src === "") {
    return;
  }

  // Local image: resolve the path and make sure it stays inside the image folder.
  if (src.startsWith("/")) {
    const path = join(LOCAL_IMAGE_DIR, src.replace(/^\/images\//, "/"));
    if (!src.startsWith("/images/") || !path.startsWith(LOCAL_IMAGE_DIR + sep)) {
      return;
    }
    // Missing files end up as 404 instead of failing in sharp.
    const file = await stat(path).catch(() => undefined);
    return file?.isFile() ? path : undefined;
  }

  // Remote image: only https and exact hostnames from the allowlist.
  /** @type {URL} */
  let url;
  try {
    url = new URL(src);
  } catch {
    return;
  }
  if (url.protocol !== "https:" || !ALLOWED_REMOTE_HOSTS.includes(url.hostname)) {
    return;
  }

  const response = await fetch(url);
  return response.ok ? await response.arrayBuffer() : undefined;
}

/**
 * Parses a width or height and caps it to avoid oversized images.
 *
 * @param {string | undefined} value
 */
function toDimension(value) {
  const number = Number.parseInt(value ?? "", 10);
  return number > 0 ? Math.min(number, MAX_DIMENSION) : undefined;
}
