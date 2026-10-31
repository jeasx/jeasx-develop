import sharp from "sharp";
import limiter from "../sharp/limiter";

const FORMATS = ["avif", "webp"];
const MAX_SIZE = 640;
// A small file can still decode to a huge image (a "decompression bomb"),
// so limit the pixels (sharp's default is 268 megapixels) and the parallel work.
const MAX_INPUT_PIXELS = 25_000_000;
const limit = limiter(2);

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
      !(size > 0 && size <= MAX_SIZE) ||
      !Number.isFinite(rotate)
    ) {
      reply.status(400).type("text/plain; charset=utf-8");
      return "Invalid upload: please choose an image, a supported format, size and rotation.";
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
    } catch {
      // Sharp throws for files that aren't images, are broken or have too many pixels.
      reply.status(400).type("text/plain; charset=utf-8");
      return "Invalid upload: the file couldn't be read as an image or is larger than 25 megapixels.";
    }

    reply.type(`image/${format}`);
    return image;
  }
}
