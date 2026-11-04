import sharp from "sharp";
import limiter, { QueueFullError } from "../sharp/limiter";

export const FORMATS = ["avif", "webp"];
export const SIZES = [160, 320, 640];
// How sharp picks the part to keep when cropping to a square.
export const STRATEGIES = [
  "entropy",
  "attention",
  "centre",
  "north",
  "south",
  "east",
  "west",
];
export const ROTATIONS = [0, 30, 45, 60, 75, 90, 180];
// Must match limits.fileSize in jeasx.config.js, which drops larger files.
export const MAX_UPLOAD_MB = 8;
// A small file can still decode to a huge image (a "decompression bomb"),
// so limit the pixels (sharp's default is 268 megapixels) and the parallel work.
const MAX_INPUT_PIXELS = 25_000_000;
// Waiting uploads keep their file in memory (up to MAX_UPLOAD_MB each), so limit the line too.
const limit = limiter(2, 8);

/** An error with a message meant for the visitor and the HTTP status to answer with. */
export class ConvertError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Validates the form fields and converts the uploaded JPEG.
 * Throws a ConvertError for invalid input or when the server is busy.
 *
 * @param {Record<string, unknown>} body
 */
export async function convert(body) {
  const upload = body["upload"];
  const format = String(body["format"]);
  const size = Number(body["size"]);
  const rotate = Number(body["rotate"]);
  const strategy = String(body["strategy"]);

  // jeasx.config.js replaces a file larger than its limit with null.
  if (upload === null) {
    throw new ConvertError(
      413,
      `The image is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller one.`,
    );
  }

  // Only accept the values the form offers.
  if (
    !Buffer.isBuffer(upload) ||
    upload.length === 0 ||
    !FORMATS.includes(format) ||
    !SIZES.includes(size) ||
    !ROTATIONS.includes(rotate) ||
    !STRATEGIES.includes(strategy)
  ) {
    throw new ConvertError(
      400,
      "Please choose an image, a format, a size, a strategy and a rotation.",
    );
  }

  // Sharp reads many formats (e.g. SVG, TIFF, GIF), but the form only promises JPEG,
  // so accept nothing else. Sharp detects the format by these leading bytes as well.
  if (!isJpeg(upload)) {
    throw new ConvertError(400, "This file isn't a JPEG image.");
  }

  try {
    return await limit(async () => {
      const input = sharp(upload, { limitInputPixels: MAX_INPUT_PIXELS });
      const original = await input.metadata();
      const { data, info } = await input
        .resize({ width: size, height: size, position: strategy })
        .rotate(rotate)
        .toFormat(/** @type {"avif" | "webp"} */ (format), { quality: 70 })
        .toBuffer({ resolveWithObject: true });
      return {
        format,
        rotate,
        original: {
          bytes: upload.length,
          width: original.width,
          height: original.height,
        },
        result: { bytes: data.length, width: info.width, height: info.height },
        dataUri: `data:image/${format};base64,${data.toString("base64")}`,
      };
    });
  } catch (error) {
    if (error instanceof QueueFullError) {
      throw new ConvertError(
        503,
        "Too many images are being converted right now. Please try again in a moment.",
      );
    }
    // Sharp throws for files that are broken or have too many pixels.
    throw new ConvertError(
      400,
      "The file couldn't be read as an image or is larger than 25 megapixels.",
    );
  }
}

/**
 * Checks for the JPEG signature (FF D8 FF).
 *
 * @param {Buffer} buffer
 */
function isJpeg(buffer) {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}
