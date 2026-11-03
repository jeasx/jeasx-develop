import Layout from "../Layout";
import { MAX_SUBTITLE, MAX_TITLE, THEMES } from "./Card";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const query = /** @type {Record<string, string | undefined>} */ (request.query);
  const title = String(query["title"] || "JSX with Ease").slice(0, MAX_TITLE);
  const subtitle = String(query["subtitle"] ?? "Social preview images rendered on the fly").slice(
    0,
    MAX_SUBTITLE,
  );
  const theme = Object.hasOwn(THEMES, query["theme"] ?? "") ? query["theme"] : "sunset";
  const src = `/og/image?${new URLSearchParams({ title, subtitle, theme })}`;

  return (
    <Layout
      title="Open Graph images"
      description="Generate social preview images from JSX: render SVG on the server and convert it to PNG with sharp."
    >
      <h1>Open Graph images</h1>
      <p>
        Links shared on social networks show a preview image from the <code>og:image</code> meta
        tag. This example draws the card as SVG with plain JSX and converts it to PNG with{" "}
        <a href="/sharp">sharp</a>, so every page can get its own image without a design tool.
      </p>
      <form method="get">
        <label>
          Title
          <input name="title" value={title} maxlength={MAX_TITLE} required />
        </label>
        <label>
          Subtitle
          <input name="subtitle" value={subtitle} maxlength={MAX_SUBTITLE} />
        </label>
        <label>
          Theme
          <select name="theme">
            {Object.keys(THEMES).map((name) => (
              <option value={name} selected={name === theme}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Render image</button>
      </form>
      <figure>
        <img src={src} width="1200" height="630" alt={title} style="width: 100%; height: auto" />
        <figcaption>
          <a href={src}>Open the PNG</a>
        </figcaption>
      </figure>
      <p>Add the image to the head of a page:</p>
      <pre>
        <code>{`<meta property="og:image" content="https://expo.jeasx.dev${src}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`}</code>
      </pre>
    </Layout>
  );
}
