import cache from "../cache";

// GitHub allows only 60 unauthenticated requests per hour, so keep the answer for a while.
const cached = cache({ ttl: 5 * 60_000 });

/**
 * Passes a remote response through to the client.
 */
export default async function () {
  let upstream;
  try {
    upstream = await cached("repository", load);
  } catch {
    return new Response("GitHub couldn't be reached right now.", {
      status: 504,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.contentType },
  });
}

/**
 * Loads the remote response. Its body is read completely, so it can be cached and sent again.
 * Network errors and timeouts are thrown.
 */
async function load() {
  // Don't wait forever for a slow upstream server. The timeout also covers the body.
  const response = await fetch("https://api.github.com/repos/jeasx/jeasx", {
    signal: AbortSignal.timeout(5000),
  });
  return {
    status: response.status,
    // Only forward what's needed; fetch already decoded the body,
    // so encoding and length headers of the upstream response no longer apply.
    contentType: response.headers.get("content-type") ?? "text/plain",
    body: await response.arrayBuffer(),
  };
}
