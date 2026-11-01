import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  // A repeated parameter arrives as array, so always work with a string.
  const text = String(request.query["text"] ?? "").slice(0, 100);
  return (
    <Layout
      title="Create SVG images with Jeasx"
      description="Generate SVG images on the server from your own text."
    >
      <h1>Create SVG images with Jeasx</h1>
      <p>
        Jeasx can create content types besides HTML. Enter some text below, and a route renders it
        into an SVG image on the fly.
      </p>
      <form action="" method="get">
        <label>
          Text for the image
          <input
            type="text"
            name="text"
            value={text}
            maxlength={100}
            autofocus
            placeholder="Enter some text"
          />
        </label>
        <input type="submit" value="Create image" />
      </form>
      {text && <img src={`/svg/logo.svg?text=${encodeURIComponent(text)}`} alt={text} />}
    </Layout>
  );
}
