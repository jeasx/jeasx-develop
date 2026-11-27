/**
 * Examples which were merged into others: old path -> new location.
 * Each path is matched exactly (a trailing slash is ignored).
 */
const REDIRECTS = {
  "/values": "/essentials#values",
  "/render-props": "/slots#render-props",
  "/aggregator": "/parallel",
  "/readable-stream": "/async-iterable",
  "/prettier": "/post-processing",
  "/cheerio": "/post-processing",
  "/negotiation": "/response#content-negotiation",
};

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Old links to merged examples keep working.
  const target = REDIRECTS[request.path.replace(/\/+$/, "")];
  if (target) {
    return new Response(null, { status: 301, headers: { location: target } });
  }

  // Prepare "this" context
  this.request = request;
  this.reply = reply;
}
