import sharp from "sharp";

const ALLOWED_IMAGE_SRC = ["/images", "https://cdn.dummyjson.com"];

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const src = request.query["src"];

  if (!ALLOWED_IMAGE_SRC.find((url) => src.startsWith(url))) {
    reply.status(404);
    return;
  }

  const width = Number(request.query["width"] || 0);
  const height = Number(request.query["height"] || 0);
  const position = request.query["position"] || undefined;

  const accept = request.headers.accept;
  const format = accept.includes("image/avif")
    ? "avif"
    : accept.includes("image/webp")
      ? "webp"
      : "jpg";

  reply.type(`image/${format}`);
  reply.header("cache-control", "public, max-age=31536000, s-maxage=31536000, immutable");

  return await sharp(
    src.startsWith("http")
      ? await (await fetch(decodeURIComponent(src))).arrayBuffer()
      : `./public/${src}`,
  )
    .resize({
      width: width || undefined,
      height: height || undefined,
      position: position || undefined,
    })
    .toFormat(format, { quality: 70 })
    .toBuffer();
}
