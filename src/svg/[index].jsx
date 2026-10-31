import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  // A repeated parameter arrives as array, so always work with a string.
  const text = String(request.query["text"] ?? "").slice(0, 100);
  return (
    <Layout title="Create SVG images with Jeasx" description="How to create SVG images with Jeasx.">
      <h1>Create SVG images with Jeasx</h1>
      <p>
        Jeasx allows you to create various content types besides HTML. This example demonstrates how
        to create an SVG image at runtime.
      </p>
      <form action="" method="get">
        <label>
          <input
            type="text"
            name="text"
            value={text}
            maxlength={100}
            autofocus
            placeholder="Enter some text"
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
      {text && <img src={`/svg/logo.svg?text=${encodeURIComponent(text)}`} alt={text} />}
    </Layout>
  );
}
