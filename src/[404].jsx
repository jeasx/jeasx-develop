import Layout from "./Layout";

export default function () {
  return (
    <Layout title="404 - Resource Not Found">
      <section class="center">
        <h1>Error 404</h1>
        <p>The resource you requested has not been found at the specified address.</p>
        <a href="/">Go to homepage</a>
      </section>
    </Layout>
  );
}
