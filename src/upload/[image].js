import sharp from "sharp";
import limiter, { QueueFullError } from "../sharp/limiter";

const FORMATS = ["avif", "webp"];
const MAX_SIZE = 640;
// Sharp accepts any angle, but values like 1e308 overflow its internal math.
const MAX_ROTATION = 360;
// A small file can still decode to a huge image (a "decompression bomb"),
// so limit the pixels (sharp's default is 268 megapixels) and the parallel work.
const MAX_INPUT_PIXELS = 25_000_000;
// Waiting uploads keep their file in memory (up to about 8 MB each), so limit the line too.
const limit = limiter(2, 8);

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  if (request.method === "POST") {
    const body = request.body || {};
    const upload = body["upload"];
    const format = body["format"];
    const size = Number(body["size"]);
    const rotate = Number(body["rotate"]);

    if (
      !Buffer.isBuffer(upload) ||
      !FORMATS.includes(format) ||
      !(Number.isInteger(size) && size > 0 && size <= MAX_SIZE) ||
      !(Number.isFinite(rotate) && Math.abs(rotate) <= MAX_ROTATION)
    ) {
      reply.status(400).type("text/plain; charset=utf-8");
      return "Invalid upload: please choose an image, a supported format, size and rotation.";
    }

    // Sharp reads many formats (e.g. SVG, TIFF, GIF), but the form only promises JPEG,
    // so accept nothing else. Sharp detects the format by these leading bytes as well.
    if (!isJpeg(upload)) {
      reply.status(400).type("text/plain; charset=utf-8");
      return "Invalid upload: please choose a JPEG image.";
    }

    let image;
    try {
      image = await limit(() =>
        sharp(upload, { limitInputPixels: MAX_INPUT_PIXELS })
          .resize({
            width: size,
            height: size,
            position: "entropy",
          })
          .rotate(rotate)
          .toFormat(format, { quality: 70 })
          .toBuffer(),
      );
    } catch (error) {
      if (error instanceof QueueFullError) {
        reply.status(503).header("retry-after", "10").type("text/plain; charset=utf-8");
        return "Too many images are being converted right now. Please try again in a moment.";
      }
      // Sharp throws for files that aren't images, are broken or have too many pixels.
      reply.status(400).type("text/plain; charset=utf-8");
      return "Invalid upload: the file couldn't be read as an image or is larger than 25 megapixels.";
    }

    reply.type(`image/${format}`);
    return image;
  }
}

/**
 * Checks for the JPEG signature (FF D8 FF).
 *
 * @param {Buffer} buffer
 */
function isJpeg(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}
