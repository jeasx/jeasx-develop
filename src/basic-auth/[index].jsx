import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Basic access authentication"
      description="Protect a part of your site with HTTP basic authentication in Jeasx."
    >
      <h1>Basic access authentication</h1>
      <p>
        This example protects a part of the site with HTTP basic authentication. It also shows how
        to let static files (such as CSS) through, so even the error page is styled.
      </p>
      <p>
        Click the link below. Your browser asks for a username and password: enter "demo" and "demo"
        to see the protected page, or press "Cancel" to see the error page instead.
      </p>
      <p>
        <a href="protected">Access protected area</a>
      </p>
    </Layout>
  );
}
