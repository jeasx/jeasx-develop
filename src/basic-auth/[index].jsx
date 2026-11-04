import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Basic access authentication"
      description="Protect a part of your site with HTTP basic authentication in Jeasx."
      css="/basic-auth/index.css"
    >
      <h1>Basic access authentication</h1>
      <p>
        This example protects a part of the site with HTTP basic authentication. A guard checks the{" "}
        <code>Authorization</code> header of every request below <code>/basic-auth/protected</code>{" "}
        and answers with <code>401</code> and a <code>WWW-Authenticate</code> header if it is
        missing or wrong. Stylesheets are let through, so even the error page is styled.
      </p>

      <article class="card-primary auth-card">
        <header>
          <strong>Try it</strong>
        </header>
        <ol>
          <li>Open the protected area below.</li>
          <li>
            When your browser asks, enter <kbd>demo</kbd> as username and password.
          </li>
          <li>Or press "Cancel" to see the error page instead.</li>
        </ol>
        <footer>
          <a href="protected" class="btn btn-primary">
            Open protected area &rarr;
          </a>
        </footer>
      </article>
      <p class="center">
        <small>
          Browsers remember the credentials until they are closed, so you won't be asked twice.
        </small>
      </p>
    </Layout>
  );
}
