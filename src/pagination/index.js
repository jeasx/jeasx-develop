// Saves the scroll position before a page link is followed. An inline script after the pager
// restores it on the next page (see "[index].jsx"), so the list doesn't jump back to the top.
// Without JavaScript, the page links still work and simply open at the top.
const nav = /** @type {HTMLElement | null} */ (document.querySelector("[data-pagination]"));

nav?.addEventListener("click", (event) => {
  if (/** @type {HTMLElement} */ (event.target).closest("a")) {
    try {
      sessionStorage.setItem(nav.dataset.pagination, String(scrollY));
    } catch {
      // Storage can be blocked, e.g. in private windows: then the next page opens at the top.
    }
  }
});

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
