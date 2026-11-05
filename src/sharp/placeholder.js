import { join } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");

/** @type {Map<string, Promise<string>>} The example uses a few fixed images, so keep them all. */
const cache = new Map();

/**
 * Returns a tiny, blurred version of a local image as data URI (well below 1 KB),
 * cropped like the full image, so it can be inlined into the HTML as placeholder.
 *
 * @param {{ src: string, width: number, height: number, position: string }} options
 */
export function placeholder({ src, width, height, position }) {
  const key = JSON.stringify([src, width, height, position]);
  if (!cache.has(key)) {
    const scale = 24 / Math.max(width, height);
    const promise = sharp(join(PUBLIC_DIR, src))
      .resize({
        width: Math.round(width * scale),
        height: Math.round(height * scale),
        position,
      })
      .blur(1)
      .webp({ quality: 50 })
      .toBuffer()
      .then((buffer) => `data:image/webp;base64,${buffer.toString("base64")}`);
    // Don't keep failures, so the next request tries again.
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return cache.get(key);
}
