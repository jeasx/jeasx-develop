import Layout from "./Layout";

export default function () {
  return (
    <Layout title="404 - Page not found">
      <h1>Error 404</h1>
      <p>The page does not exist.</p>
      <a href="/wizard">Back to the wizard</a>
    </Layout>
  );
}
