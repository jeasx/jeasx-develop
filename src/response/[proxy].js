/**
 * Passes a remote response straight through to the client.
 */
export default async function () {
  let response;
  try {
    // Don't wait forever for a slow upstream server. The timeout also covers the body.
    response = await fetch("https://api.github.com/repos/jeasx/jeasx", {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return new Response("GitHub couldn't be reached right now.", {
      status: 504,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  // Only forward what's needed; fetch already decoded the body,
  // so encoding and length headers of the upstream response no longer apply.
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "text/plain" },
  });
}
