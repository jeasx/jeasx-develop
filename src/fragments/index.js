import "htmx.org";

// Log every fragment request with its URL, status, size and duration.
const started = new WeakMap();

document.addEventListener("htmx:before:request", (event) => {
  started.set(event.detail.ctx, performance.now());
});

document.addEventListener("htmx:after:request", (event) => {
  const { ctx } = event.detail;
  const log = document.getElementById("tf-log");
  if (!log) return;
  log.querySelector(".tf-log-empty")?.remove();

  const url = new URL(ctx.request.action, location.href);
  const ms = Math.round(performance.now() - (started.get(ctx) ?? performance.now()));
  const bytes = new TextEncoder().encode(ctx.text ?? "").length;

  const item = document.createElement("li");
  item.className = url.pathname.endsWith("~time") ? "time" : "product";
  item.innerHTML = `<code></code><span>${ctx.response.status} · ${(bytes / 1024).toFixed(1)} kB · ${ms} ms</span>`;
  item.querySelector("code").textContent = url.pathname.split("/").pop() + url.search;
  log.prepend(item);

  // Keep the log short.
  while (log.children.length > 6) log.lastElementChild.remove();
});
