import streamInto from "./streamInto";
import livePanel from "./livePanel";
import { Dependencies } from "./Package";
import { createRegistry } from "./registry";
import Tree from "./Tree";

const form = /** @type {HTMLFormElement} */ (document.getElementById("explorer"));
const result = document.getElementById("result");
const live = livePanel(document.getElementById("live"));

/** Aborted when a new tree replaces the current one: cancels its streams and requests. */
let controller = new AbortController();
/** Shared by the tree and all packages opened in it, so nothing is fetched twice. */
let registry = createRegistry(controller.signal);

// The server rendered the first tree: show its numbers, then follow the
// packages opened in it.
live.showServerStats(result.querySelector(".stats"));
live.track(registry, controller.signal);

/**
 * Replaces the whole tree with a package and its direct dependencies.
 *
 * @param {string} name
 */
function explore(name) {
  controller.abort();
  controller = new AbortController();
  registry = createRegistry(controller.signal);
  live.reset();
  live.track(registry, controller.signal);
  result.innerHTML = "";
  streamInto(result, <Tree name={name} where="in your browser" registry={registry} />, {
    signal: controller.signal,
  });
}

/**
 * Drills into a package: opening a collapsed package streams its direct
 * dependencies into it. They are collapsed again, so you can keep drilling.
 * The placeholder rows stay behind the streamed packages until each one is
 * replaced, so the list keeps its height while it loads.
 *
 * @param {HTMLDetailsElement} details
 */
async function drill(details) {
  const name = details.dataset.name;
  const list = details.querySelector(":scope > .more");
  if (!name || !list) {
    return;
  }
  delete details.dataset.name; // Load only once.
  const ancestors = JSON.parse(details.dataset.ancestors);
  const { signal } = controller;
  const names = registry.children(await registry.get(name));
  if (signal.aborted) {
    return;
  }
  // Start all requests at once; the components render in order.
  for (const dependency of names) {
    registry.prefetch(dependency, 0, ancestors);
  }
  await streamInto(
    list,
    <Dependencies names={names} depth={0} registry={registry} ancestors={ancestors} list={false} />,
    { signal, placeholder: list.firstElementChild?.outerHTML, count: names.length },
  );
  list.classList.remove("more");
}

// The toggle event doesn't bubble, so listen in the capture phase.
result.addEventListener(
  "toggle",
  (event) => {
    const details = event.target;
    if (details instanceof HTMLDetailsElement && details.open) {
      drill(details);
    }
  },
  true,
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  explore(String(data.get("name")).trim().toLowerCase());
});

document.querySelector(".examples").addEventListener("click", (event) => {
  const button = /** @type {Element} */ (event.target).closest("[data-name]");
  if (!(button instanceof HTMLElement)) {
    return;
  }
  /** @type {HTMLInputElement} */ (form.elements.namedItem("name")).value = button.dataset.name;
  form.requestSubmit();
});
