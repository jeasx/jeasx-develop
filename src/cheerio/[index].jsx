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
    >
      <div style="--mu-h1-color:orange; text-align: center">
        <h1>Extract inline styles with Cheerio</h1>
      </div>
      <p style="color:green; text-align:left">
        Jeasx lets you post-process the finished HTML with a{" "}
        <a href="https://www.jeasx.dev/faq#response-handler">response handler</a>. This example uses{" "}
        <a href="https://cheerio.js.org">Cheerio</a> to turn all inline styles into CSS classes in
        the head of the page. Compare the original and the rewritten markup below, and have a look
        at the source to see how it is wired up.
      </p>
      <style>{
        /*css*/ `
        .iframe-wrapper {
          flex: 1 1 20rem;
        }
      `
      }</style>
      {/* Side by side on wide screens, stacked on phones. */}
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <IFrame title="Original source" src="?text=plain&source=raw" />
        <IFrame title="Rewritten markup" src="?text=plain" />
      </div>
    </Layout>
  );
}

function IFrame({ title, src }) {
  return (
    <>
      <div class="iframe-wrapper">
        <h3 style="text-align:center">{title}</h3>
        <iframe src={src} style="width: 100%; height: 300px; border: 1px solid lightgray;"></iframe>
      </div>
    </>
  );
}
