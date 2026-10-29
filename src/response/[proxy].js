/**
 * Passes a remote response straight through to the client.
 */
export default async function () {
  const response = await fetch("https://api.github.com/repos/jeasx/jeasx");
  // Only forward what's needed; fetch already decoded the body,
  // so encoding and length headers of the upstream response no longer apply.
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "text/plain" },
  });
}
