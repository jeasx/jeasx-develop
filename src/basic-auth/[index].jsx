import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Basic access authentication with Jeasx"
      description="This example demonstrates how to set up basic authentication with Jeasx."
    >
      <h1>Basic access authentication</h1>
      <p>
        This example demonstrates how to set up basic authentication with Jeasx. It also shows how
        to exclude static files (such as CSS) from the authentication requirement.
      </p>
      <p>
        To view this example, click the link below and select 'Cancel' on the authentication dialog.
        Then, reload the page and enter the correct credentials.
      </p>
      <p>
        <a href="protected">Access forbidden area</a>
      </p>
    </Layout>
  );
}
