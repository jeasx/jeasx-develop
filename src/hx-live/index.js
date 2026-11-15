import "htmx.org";
import "htmx.org/dist/ext/hx-live";

// The Clipboard API only exists in secure contexts, so fall back to execCommand elsewhere.
// Global, so the hx-on handlers in the page can call it.
/** @type {any} */ (window).copyCss = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
};
