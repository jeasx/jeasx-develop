import Layout from "./Layout";

export default function () {
  return (
    <Layout title="404 - Page not found">
      <section class="center">
        <h1>Error 404</h1>
        <p>The page you are looking for doesn't exist. Please check the address or start over.</p>
        <a href="/">Go to homepage</a>
      </section>
    </Layout>
  );
}
