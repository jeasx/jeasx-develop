import Layout from "./Layout";

/**
 * @param {import("./types").RouteProps} props
 */
export default function ({ request }) {
  return (
    <Layout title="Error 404" robots="noindex" showHeader={false}>
      <section class="home-hero">
        <p class="home-eyebrow">Error 404</p>
        <h1>
          <span class="shell-gradient">Page not found</span>
        </h1>
        <p class="home-tagline">
          There is nothing at <code>{request.path}</code>. Please check the address.
        </p>
        <p class="home-actions">
          <a href="/" role="button">
            Browse examples
          </a>
        </p>
      </section>
    </Layout>
  );
}
