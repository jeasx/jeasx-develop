import Layout from "../Layout";

export default function () {
  return (
    <Layout title="Page not found">
      <section class="center">
        <h1>Error 404</h1>
        <p>The page you are looking for was moved, removed or might never have existed.</p>
        <a href="/blog">Back to blog</a>
      </section>
    </Layout>
  );
}
