import { jsxToString } from "jsx-async-runtime";
import sharp from "sharp";
import limiter, { QueueFullError } from "../sharp/limiter";
import Card, { MAX_SUBTITLE, MAX_TITLE, THEMES } from "./Card";

// Rendering is expensive, so keep recent results and limit parallel work.
const MAX_CACHE_ENTRIES = 200;
const limit = limiter(2, 50);

/**
 * Renders the card as SVG with JSX and converts it to PNG with sharp,
 * as social networks don't accept SVG for Open Graph images.
 *
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const query = /** @type {Record<string, string | undefined>} */ (
    request.query
  );
  const title = String(query["title"] || "Hello Jeasx").slice(0, MAX_TITLE);
  const subtitle = String(query["subtitle"] ?? "").slice(0, MAX_SUBTITLE);
  const theme = Object.hasOwn(THEMES, query["theme"] ?? "")
    ? query["theme"]
    : "sunset";
  const key = JSON.stringify([title, subtitle, theme]);

  let png = cache.get(key);
  if (!png) {
    try {
      png = await limit(async () => {
        const svg = await jsxToString(Card({ title, subtitle, theme }));
        return sharp(Buffer.from(svg)).png().toBuffer();
      });
    } catch (error) {
      if (error instanceof QueueFullError) {
        reply
          .status(503)
          .header("retry-after", "10")
          .type("text/plain; charset=utf-8");
        return "Too many images are being rendered right now. Please try again in a moment.";
      }
      throw error;
    }
    cache.set(key, png);
    if (cache.size > MAX_CACHE_ENTRIES) {
      cache.delete(cache.keys().next().value);
    }
  }

  reply.type("image/png");
  reply.header("cache-control", "public, max-age=86400, s-maxage=86400");
  return png;
}

/** @type {Map<string, Buffer>} Oldest entries come first. */
const cache = new Map();
