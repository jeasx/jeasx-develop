import Prism from "prismjs";
/**
 * Wraps the markup in a small standalone page with Prism highlighting.
 * When `changed` is given, those lines are marked and all others dimmed.
 * @param {string} markup
 * @param {Set<number>} [changed]
 * @param {"added" | "removed"} kind
 */
export default function highlightMarkup(markup, changed, kind = "added") {
  const code = Prism.highlight(markup, Prism.languages.markup, "markup");
  // Tokens can span lines, so open spans are closed at each line end and reopened on the next.
  const open = [];
  const lines = code.split("\n").map((line, index) => {
    const prefix = open.join("");
    for (const [tag] of line.matchAll(/<span[^>]*>|<\/span>/g)) {
      tag === "</span>" ? open.pop() : open.push(tag);
    }
    const body = prefix + line + "</span>".repeat(open.length);
    return `<span class="line${changed?.has(index) ? " " + kind : ""}">${body}</span>`;
  });
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #1e1f26; color: #f8f8f2; }
  pre { margin: 0; padding: 1rem 0; font: 0.8rem/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
  .line { display: block; padding: 0 1rem; border-left: 3px solid transparent; }
  ${changed ? ".line:not(.added):not(.removed) { opacity: 0.45; }" : ""}
  .added { background: rgb(40 200 64 / 0.18); border-left-color: #28c840; }
  .removed { background: rgb(255 95 87 / 0.18); border-left-color: #ff5f57; }
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #8292a2; }
  .token.punctuation { color: #a0a4b0; }
  .token.tag { color: #f92672; }
  .token.attr-name { color: #a6e22e; }
  .token.attr-value, .token.string { color: #e6db74; }
  .token.attr-value > .token.punctuation { color: #e6db74; }
  .token.entity { color: #fd971f; }
  .token.selector { color: #a6e22e; }
  .token.property { color: #66d9ef; }
</style>
</head>
<body><pre><code>${lines.join("")}</code></pre>
<script>
  // Scroll only this frame (scrollIntoView would move the parent page too).
  const first = document.querySelector(".added, .removed");
  if (first) scrollTo(0, first.offsetTop - innerHeight / 3);
</script>
</body>
</html>`;
}
