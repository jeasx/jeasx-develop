addEventListener("load", () => {
  document.querySelectorAll('a[href^="https"]').forEach((el) => {
    if (el instanceof HTMLAnchorElement) {
      el.target = "_blank";
    }
  });
});
