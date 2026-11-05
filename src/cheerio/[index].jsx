import * as prettier from "prettier";
import toText from "../@helpers/toText";
import Layout from "../Layout";
import extractStyles from "./extractStyles";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.query["text"] === "plain") {
    reply.type("text/plain; charset=utf-8");
  }

  this.responseHandler = async (payload) => {
    // Cheerio and Prettier need the complete markup, so a streamed payload is collected first.
    const html = await toText(this, payload);
    if (html === undefined) {
      return payload;
    }
    return await prettier.format(request.query["source"] === "raw" ? html : extractStyles(html), {
      parser: "html",
    });
  };

  return (
    <Layout
      title="Extract inline styles with Cheerio"
      description="Post-process the resulting HTML with Cheerio to move inline styles into the head."
      css="/cheerio/index.css"
    >
      <div style="--heading:orange; text-align: center">
        <h1>Extract inline styles with Cheerio</h1>
      </div>
      <p style="color:green; text-align:left">
        Jeasx lets you post-process the finished HTML with a{" "}
        <a href="https://www.jeasx.dev/faq#response-handler">response handler</a>. This example uses{" "}
        <a href="https://cheerio.js.org">Cheerio</a> to turn all inline styles into CSS classes in
        the head of the page.
      </p>
      <p>
        Identical declarations share one class, so repeated inline styles shrink to a single rule.
        This page itself uses a few inline styles on purpose: compare the original and the rewritten
        markup below, and have a look at the source to see how it is wired up.
      </p>
      {/* Side by side on wide screens, stacked on phones. */}
      <div class="compare">
        <IFrame title="Original source" src="?text=plain&source=raw" />
        <IFrame title="Rewritten markup" src="?text=plain" />
      </div>
    </Layout>
  );
}

function IFrame({ title, src }) {
  return (
    <figure class="compare-item">
      <iframe title={title} src={src}></iframe>
      <figcaption>{title}</figcaption>
    </figure>
  );
}
