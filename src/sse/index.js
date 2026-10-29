const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));

const events = new EventSource("/sse/events");

events.addEventListener("open", () => ($("status").textContent = "Connected"));
events.addEventListener("error", () => ($("status").textContent = "Reconnecting…"));

events.addEventListener("stats", (event) => {
  const { time, uptime, memory, clients } = JSON.parse(event.data);
  $("time").textContent = time;
  $("uptime").textContent = `${uptime}s`;
  $("memory").textContent = `${(memory / 1024 / 1024).toFixed(1)} MB`;
  $("clients").textContent = clients;
});
