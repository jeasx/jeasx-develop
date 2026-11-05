import sharp from "sharp";
import limiter, { QueueFullError } from "../sharp/limiter";

export const FORMATS = ["avif", "webp"];
// The image formats sharp can read from a buffer. "raw" is bare pixel data, and SVG
// is skipped because rendering it can be costly and exposes the SVG parser.
// "heif" covers AVIF, as the prebuilt sharp binaries don't decode HEIC.
export const INPUT_FORMATS = Object.values(sharp.format)
  .filter((f) => f.input.buffer && !["raw", "svg"].includes(f.id))
  .map((f) => f.id);
export const SIZES = [160, 320, 640];
// How sharp picks the part to keep when cropping to a square.
export const STRATEGIES = ["entropy", "attention", "centre", "north", "south", "east", "west"];
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
 * Validates the form fields and converts the uploaded image.
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

  try {
    return await limit(async () => {
      const input = sharp(upload, { limitInputPixels: MAX_INPUT_PIXELS });
      // Sharp detects the format from the file's content, not its name.
      const original = await input.metadata();
      if (!INPUT_FORMATS.includes(original.format)) {
        throw new Error(`Unsupported format: ${original.format}`);
      }
      const { data, info } = await input
        .resize({ width: size, height: size, position: strategy })
        .rotate(rotate)
        .toFormat(/** @type {"avif" | "webp"} */ (format), { quality: 70 })
        .toBuffer({ resolveWithObject: true });
      return {
        format,
        rotate,
        original: {
          format: original.format,
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
    // Sharp throws for files that are broken, unsupported or have too many pixels.
    throw new ConvertError(
      400,
      "The file couldn't be read as a supported image or is larger than 25 megapixels.",
    );
  }
}
