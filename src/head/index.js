// Shows title, meta tags and styles of the merged head, one tag per line.
const tags = document.head.querySelectorAll("title, meta[name], style");
document.getElementById("head-result").textContent = [...tags]
  .map((tag) =>
    tag.tagName === "STYLE" ? `<style>\n${formatCss(tag.textContent)}</style>` : tag.outerHTML,
  )
  .join("\n");

/**
 * A tiny CSS formatter: one declaration per line, indented by nesting depth.
 * Good enough for display; strings containing braces or semicolons aren't handled.
 *
 * @param {string} css
 */
function formatCss(css) {
  let depth = 1;
  let out = "";
  const line = (text) => (out += `${"  ".repeat(depth)}${text.trim()}\n`);
  for (const token of css.replace(/\s+/g, " ").split(/(?<=[{};])/)) {
    if (token.endsWith("{")) {
      line(token.slice(0, -1).trim() + " {");
      depth++;
    } else if (token.endsWith("}")) {
      if (token.slice(0, -1).trim()) line(token.slice(0, -1));
      depth--;
      line("}");
    } else if (token.trim()) {
      line(token);
    }
  }
  return out;
}
