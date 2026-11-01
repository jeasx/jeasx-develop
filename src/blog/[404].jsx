import Layout from "../Layout";

export default function () {
  return (
    <Layout title="404 - Page not found">
      <section class="center">
        <h1>Error 404</h1>
        <p>This post doesn't exist. It may have been removed, or the address is mistyped.</p>
        <a href="/blog">Back to blog</a>
      </section>
    </Layout>
  );
}
