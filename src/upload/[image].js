import sharp from "sharp";

const FORMATS = ["avif", "webp"];
const MAX_SIZE = 640;

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

    const image = await sharp(upload)
      .resize({
        width: size,
        height: size,
        position: "entropy",
      })
      .rotate(rotate)
      .toFormat(format, { quality: 70 })
      .toBuffer();

    reply.type(`image/${format}`);
    return image;
  }
}
