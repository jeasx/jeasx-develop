import { stat } from "node:fs/promises";
import { join, sep } from "node:path";
import sharp from "sharp";
import limiter from "./limiter";

const LOCAL_IMAGE_DIR = join(process.cwd(), "public", "images");
const ALLOWED_REMOTE_HOSTS = ["cdn.dummyjson.com"];
const MAX_REMOTE_BYTES = 10 * 1024 * 1024;
const REMOTE_TIMEOUT = 5000;
const MAX_DIMENSION = 2000;
// A small file can still decode to a huge image (a "decompression bomb"),
// so limit the pixels like for uploads (sharp's default is 268 megapixels).
const MAX_INPUT_PIXELS = 25_000_000;
// Converting is expensive, so keep recent results and limit parallel work.
const MAX_CACHE_ENTRIES = 100;
const limit = limiter(2);
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

  const width = toDimension(query["width"]);
  const height = toDimension(query["height"]);
  const key = JSON.stringify([query["src"], width, height, position, format]);

  // Downloading (up to MAX_REMOTE_BYTES) and converting both run within the limit,
  // so requests waiting in line don't hold any image data in memory.
  const image =
    cacheGet(key) ??
    (await limit(async () => {
      // Another request may have converted the same image while this one was waiting.
      const cached = cacheGet(key);
      if (cached) {
        return cached;
      }
      const input = await loadImage(query["src"]);
      if (!input) {
        return;
      }
      try {
        const converted = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
          .resize({ width, height, position })
          .toFormat(format, { quality: 70 })
          .toBuffer();
        cacheSet(key, converted);
        return converted;
      } catch {
        // Broken images and images with too many pixels end up as 404.
        return;
      }
    }));
  if (!image) {
    return;
  }

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

  try {
    // Don't follow redirects, as they could lead to hosts outside the allowlist.
    // The timeout also covers reading the body.
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(REMOTE_TIMEOUT),
    });
    return response.ok ? await readBody(response, MAX_REMOTE_BYTES) : undefined;
  } catch {
    // Network errors, timeouts and redirects end up as 404.
    return;
  }
}

/**
 * Reads the response body, but gives up once it grows beyond maxBytes.
 *
 * @param {Response} response
 * @param {number} maxBytes
 */
async function readBody(response, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > maxBytes) {
      // Leaving the loop cancels the download.
      return;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** @type {Map<string, Buffer>} Least recently used entries come first. */
const cache = new Map();

/** @param {string} key */
function cacheGet(key) {
  const value = cache.get(key);
  if (value) {
    // Move to the end, so it is evicted last.
    cache.delete(key);
    cache.set(key, value);
  }
  return value;
}

/**
 * @param {string} key
 * @param {Buffer} value
 */
function cacheSet(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
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
