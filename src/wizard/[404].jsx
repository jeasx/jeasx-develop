import Layout from "./Layout";

export default function () {
  return (
    <Layout title="Error 404">
      <section class="center">
        <h2>Error 404</h2>
        <p>This step of the claim form doesn't exist.</p>
        <a href="/wizard">Back to the claim form</a>
      </section>
    </Layout>
  );
}
