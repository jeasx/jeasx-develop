// Asks before a form with a data-confirm attribute is sent, e.g. to delete a movie.
// Without JavaScript, the form is simply sent: the page works either way.
document.addEventListener("submit", (event) => {
  const form = /** @type {HTMLFormElement} */ (event.target);
  if (form.dataset.confirm && !confirm(form.dataset.confirm)) {
    event.preventDefault();
  }
});

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
