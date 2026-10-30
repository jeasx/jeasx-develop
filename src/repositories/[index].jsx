import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  this.jsxStream = true;

  const search = request.query["search"] || "jeasx";

  return (
    <Layout title="Search GitHub Repositories" description="A list of repositories at GitHub.">
      <h1 class="center">Search GitHub Repositories</h1>
      <p>
        The page is streamed with <code>this.jsxStream = true</code>: the page shell and a loading
        indicator are sent to the browser right away, while the repositories are still fetched from
        the GitHub API. As soon as the results arrive, they are streamed in after the indicator,
        which is then hidden by a single CSS rule. No client-side JavaScript is involved.
      </p>
      <form method="get">
        <input type="search" name="search" placeholder="Search..." value={search} />
      </form>
      <div class="loader">
        {/* Flushed immediately; hidden via CSS as soon as the results are streamed in after it. */}
        <p aria-busy="true">Loading repositories...</p>
        <Repositories search={search} />
      </div>
    </Layout>
  );
}

async function Repositories({ search }) {
  const repositories = (
    await (
      await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          search,
        )}+in:name&sort=updated`,
      )
    ).json()
  ).items.filter(({ full_name }) =>
    search === "jeasx" ? full_name.startsWith(search) : full_name.includes(search),
  );
  return (
    <ul>
      {repositories.map(({ html_url, full_name, description }) => (
        <li>
          <a href={html_url}>{full_name}</a>
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}
