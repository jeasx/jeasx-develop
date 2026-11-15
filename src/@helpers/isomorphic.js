// Runs a server-rendered page in the browser with the same code the server uses.
//
// An example splits its page into two parts, shared by server and browser:
// - reduce(state, input): returns the next state for a form submission
//   (input are the submitted fields, as strings, like request.body on the server).
// - View(state): renders the interactive part, sync or async. Its root element carries
//   the state as `data-state={JSON.stringify(state)}`, so the browser can pick it up.
//
// Without JavaScript, every form posts to the server, which reduces and renders the page.
// With JavaScript, mount() handles the submit in the browser instead: it reduces the state
// locally and re-renders the root element with jsxToString. Same code, no page reload.
//
// reduce may also be async, e.g. to load data: give it a loader which reads the data
// directly on the server and fetches it from an API in the browser (see "src/jokes").
import { jsxToString } from "jsx-async-runtime";

/**
 * @template S
 * @param {{
 *   root: string,
 *   View: (state: S) => any,
 *   reduce: (state: S, input: Record<string, string>) => S | Promise<S>,
 *   navigate?: (state: S, url: URL) => S,
 *   persist?: (input: Record<string, string>, form: HTMLFormElement) => Promise<unknown>,
 * }} options
 *   - root: selector of the element View renders (and replaces on every render).
 *   - navigate: handles links to the same page (e.g. "?status=active") without reloading.
 *   - persist: saves a change on the server (e.g. in a cookie) after it was rendered.
 */
export function mount({ root, View, reduce, navigate, persist }) {
  const element = document.querySelector(root);
  if (!(element instanceof HTMLElement)) {
    return;
  }
  /** @type {S} */
  let state = JSON.parse(element.dataset.state ?? "null");

  /** @param {S} next */
  async function render(next) {
    state = next;
    const current = document.querySelector(root);
    // Keep the focus on the control you just used, e.g. the clicked button.
    const active = /** @type {HTMLElement | null} */ (document.activeElement);
    const focus = current?.contains(active) ? selectorOf(active) : undefined;
    current.outerHTML = await jsxToString(View(state));
    const updated = document.querySelector(root);
    /** @type {HTMLElement | null} */ (
      (focus && updated.querySelector(focus)) || updated.querySelector("[autofocus]")
    )?.focus();
  }

  // Updates run one after another, so an async reduce always starts from the latest state.
  /** @type {Promise<unknown>} */
  let updates = Promise.resolve();

  /**
   * @param {(state: S) => S | Promise<S>} change
   * @param {Element | null} [trigger] e.g. the clicked button, which shows a spinner while loading
   */
  function update(change, trigger) {
    updates = updates
      .then(async () => {
        // Not on the root: the global styles would draw the spinner above it and shift the page.
        trigger?.setAttribute("aria-busy", "true");
        await render(await change(state));
      })
      .catch((error) => {
        console.error(error);
        trigger?.removeAttribute("aria-busy");
      });
  }

  // Saves run one after another, so the server applies them in the same order.
  /** @type {Promise<unknown>} */
  let queue = Promise.resolve();

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.closest(root)) {
      return;
    }
    event.preventDefault();
    const submitter = /** @type {SubmitEvent} */ (event).submitter;
    /** @type {Record<string, string>} */
    const input = Object.fromEntries(
      [...new FormData(form, submitter)].map(([key, value]) => [key, String(value)]),
    );
    update((state) => reduce(state, input), submitter);
    if (persist) {
      queue = queue
        .then(() => persist(input, form))
        .catch((error) => {
          console.error(error);
          // Out of sync with the server: show what it knows.
          location.reload();
        });
    }
  });

  if (navigate) {
    document.addEventListener("click", (event) => {
      const link = /** @type {Element} */ (event.target).closest?.("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        !link.closest(root) ||
        // The layout's <base href> adds a trailing slash, e.g. "/todos/?status=active".
        trimSlash(link.pathname) !== trimSlash(location.pathname) ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      event.preventDefault();
      const url = new URL(location.pathname + link.search + link.hash, location.href);
      history.pushState(null, "", url);
      update((state) => navigate(state, url));
    });
    addEventListener("popstate", () => {
      update((state) => navigate(state, new URL(location.href)));
    });
  }
}

/**
 * Sends a form to the server like the browser would without JavaScript,
 * but asks for JSON, so the server can skip rendering the page.
 *
 * @param {Record<string, string>} input
 * @param {HTMLFormElement} form
 */
export async function postForm(input, form) {
  const response = await fetch(form.action || location.href, {
    method: "POST",
    headers: { accept: "application/json" },
    body: new URLSearchParams(input),
  });
  if (!response.ok) {
    throw new Error(`Saving failed: ${response.status}`);
  }
}

/** @param {string} path */
function trimSlash(path) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

/** @param {HTMLElement} element */
function selectorOf(element) {
  const name = element.getAttribute("name");
  if (!name) {
    return undefined;
  }
  // Buttons share a name (e.g. "number"), their value tells them apart.
  const value = element instanceof HTMLButtonElement ? element.getAttribute("value") : null;
  return value === null
    ? `[name="${CSS.escape(name)}"]`
    : `[name="${CSS.escape(name)}"][value="${CSS.escape(value)}"]`;
}
