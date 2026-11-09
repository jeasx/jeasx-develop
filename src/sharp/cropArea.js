import { join } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");

/** @type {Map<string, Promise<CropArea>>} The example uses a few fixed images, so keep them all. */
const cache = new Map();

/**
 * @typedef {object} CropArea
 * @property {number} originalWidth
 * @property {number} originalHeight
 * @property {number} left share of the original width, from 0 to 1
 * @property {number} top share of the original height, from 0 to 1
 * @property {number} width share of the original width, from 0 to 1
 * @property {number} height share of the original height, from 0 to 1
 */

/**
 * Returns which part of a local image sharp keeps when cropping it, so the page can mark it
 * on the original. sharp reports the offset for "entropy" and "attention", not for "centre".
 *
 * @param {{ src: string, width: number, height: number, position: string }} options
 * @returns {Promise<CropArea>}
 */
export function cropArea({ src, width, height, position }) {
  const key = JSON.stringify([src, width, height, position]);
  if (!cache.has(key)) {
    const promise = (async () => {
      const image = sharp(join(PUBLIC_DIR, src));
      const { width: originalWidth = 0, height: originalHeight = 0 } =
        await image.metadata();
      const { info } = await image
        .resize({ width, height, position })
        .toBuffer({ resolveWithObject: true });
      // The image is first scaled to cover the target size, then cut down to it.
      const scale = Math.max(width / originalWidth, height / originalHeight);
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const offsetLeft = Math.abs(
        info.cropOffsetLeft ?? (scaledWidth - width) / 2,
      );
      const offsetTop = Math.abs(
        info.cropOffsetTop ?? (scaledHeight - height) / 2,
      );
      return {
        originalWidth,
        originalHeight,
        left: offsetLeft / scaledWidth,
        top: offsetTop / scaledHeight,
        width: width / scaledWidth,
        height: height / scaledHeight,
      };
    })();
    // Don't keep failures, so the next request tries again.
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return /** @type {Promise<CropArea>} */ (cache.get(key));
}
