import sharp from "sharp";

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
    reply.type(`image/${format}`);
    return await sharp(upload)
      .resize({
        width: size,
        height: size,
        position: "entropy",
      })
      .rotate(rotate)
      .toFormat(format, { quality: 70 })
      .toBuffer();
  } else {
    reply.status(404);
    return;
  }
}
