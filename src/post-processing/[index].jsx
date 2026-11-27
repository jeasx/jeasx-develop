import * as prettier from "prettier";
import highlightMarkup from "../@helpers/highlightMarkup";
import toText from "../@helpers/toText";
import Layout from "../Layout";
import extractStyles from "./extractStyles";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  this.responseHandler = async (payload) => {
    // Cheerio and Prettier need the complete markup, so a streamed payload is collected first.
    const html = await toText(this, payload);
    if (html === undefined) {
      return payload;
    }
    // Cheerio: the page itself is always delivered with its inline styles extracted.
    const raw = request.query["source"] === "raw";
    const format = (markup) => prettier.format(markup, { parser: "html" });
    const markup = await format(raw ? html : extractStyles(html));
    if (request.query["view"] !== "code") {
      return markup;
    }
    // Compare with the other version, so each pane can mark its changed lines.
    const other = await format(raw ? extractStyles(html) : html);
    return highlightMarkup(markup, changedLines(markup, other), raw ? "removed" : "added");
  };

  return (
    <Layout
      title="Post-process HTML with Prettier and Cheerio"
      description="Rewrite the finished HTML in a response handler: move inline styles into the head with Cheerio and format the result with Prettier."
      css="/post-processing/index.css"
    >
      {/* The inline styles on this page are deliberate: they are what the Cheerio step rewrites. */}
      <section class="pp-hero" style="--heading:orange; text-align:center">
        <h1>Post-process HTML with Prettier and Cheerio</h1>
        <p class="lead">
          Jeasx lets you rewrite the finished HTML with a{" "}
          <a href="https://www.jeasx.dev/faq#response-handler">response handler</a>. It is set on{" "}
          <code>this.responseHandler</code>, receives the rendered payload and returns the new text.
          This page rewrites its very own markup.
        </p>
      </section>

      <h2>Extract inline styles with Cheerio</h2>
      <p>
        <a href="https://cheerio.js.org">Cheerio</a> turns all inline styles into CSS classes in the
        head of the page.
      </p>
      <ol class="pp-steps">
        <li>
          <strong style="color:orange">Render</strong>
          <span>JSX produces HTML full of inline style attributes.</span>
        </li>
        <li>
          <strong style="color:orange">Collect</strong>
          <span>Cheerio finds each declaration; identical ones share a single class.</span>
        </li>
        <li>
          <strong style="color:orange">Rewrite</strong>
          <span>Classes go into one style tag in the head and Prettier formats the result.</span>
        </li>
      </ol>
      <p style="text-align:center; color:var(--muted)">
        Compare the original and the rewritten markup of this very page below.
      </p>
      {/* Side by side on wide screens, stacked on phones. */}
      <div class="compare">
        <IFrame title="Original source" badge="before" src="?view=code&source=raw" />
        <IFrame title="Rewritten markup" badge="after" src="?view=code" />
      </div>
    </Layout>
  );
}

function IFrame({ title, badge, src }) {
  return (
    <figure class="compare-item">
      <figcaption>
        <i></i>
        <i></i>
        <i></i>
        {title}
        <em>{badge}</em>
      </figcaption>
      <iframe title={title} src={src}></iframe>
    </figure>
  );
}

/**
 * Returns the indexes of lines in `a` which are not part of the longest common
 * subsequence with `b`, so they were removed or added by the rewrite.
 * @param {string} a
 * @param {string} b
 */
function changedLines(a, b) {
  const x = a.split("\n");
  const y = b.split("\n");
  const lengths = Array.from({ length: x.length + 1 }, () => new Uint16Array(y.length + 1));
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      lengths[i][j] =
        x[i] === y[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const changed = new Set();
  let i = 0;
  let j = 0;
  while (i < x.length) {
    if (j < y.length && x[i] === y[j]) {
      i++;
      j++;
    } else if (j < y.length && lengths[i][j + 1] >= lengths[i + 1][j]) {
      j++;
    } else {
      changed.add(i++);
    }
  }
  return changed;
}
