export default function () {
  return new Response("I'm a teapot. I refuse to brew coffee. 🫖", {
    status: 418,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
