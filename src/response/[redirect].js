export default function () {
  // Response.redirect() requires an absolute URL, but building one from the
  // Host header lets clients pick the target. A relative Location is enough.
  return new Response(null, { status: 303, headers: { location: "/response" } });
}
