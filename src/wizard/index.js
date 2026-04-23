addEventListener("load", () => {
  document.querySelectorAll("[data-submit]").forEach((el) => {
    if (el instanceof HTMLElement) {
      el.addEventListener(el.dataset.submit, (e) => {
        e.target["form"].submit();
      });
    }
  });
});
