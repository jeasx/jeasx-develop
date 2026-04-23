import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const text = request.query?.["text"];
  return (
    <Layout title="Create SVG images with Jeasx" description="How to create SVG images with Jeasx.">
      <h1>Create SVG images with Jeasx</h1>
      <p>
        Jeasx allows you to create various content types besides HTML. This example demonstrates how
        to create a SVG image at runtime.
      </p>
      <form action="" method="get">
        <label>
          <input type="text" name="text" value={text} autofocus placeholder="Enter some text" />
        </label>
        <input type="submit" value="Submit" />
      </form>
      {text && <img src={`/svg/logo.svg?text=${encodeURIComponent(text)}`} />}
    </Layout>
  );
}
