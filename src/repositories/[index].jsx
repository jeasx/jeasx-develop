import cache from "../cache";
import Layout from "../Layout";

// GitHub allows only 10 unauthenticated searches per minute, so keep the results for a while.
const cached = cache({ ttl: 5 * 60_000 });

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  this.jsxStream = true;

  // A repeated parameter arrives as array, so always work with a string.
  const search = String(request.query["search"] || "jeasx");

  return (
    <Layout title="Search GitHub Repositories" description="A list of repositories on GitHub.">
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
  const items = await cached(search, () => searchRepositories(search));
  if (!items) {
    return <p>GitHub couldn't be reached right now. Please try again later.</p>;
  }
  // GitHub ignores case when searching, so the filter does too.
  const term = search.toLowerCase();
  const repositories = items.filter(({ full_name }) => {
    const name = String(full_name).toLowerCase();
    return term === "jeasx" ? name.startsWith(term + "/") : name.includes(term);
  });
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

/**
 * Searches GitHub; returns undefined if it can't be reached right now,
 * e.g. when the rate limit for unauthenticated requests was hit or it timed out.
 *
 * @param {string} search
 */
async function searchRepositories(search) {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}+in:name&sort=updated`,
      // Don't wait forever for a slow server. The timeout also covers the body.
      { signal: AbortSignal.timeout(5000) },
    );
    // Error responses may not be JSON, so only parse successful ones.
    const { items } = response.ok ? await response.json() : {};
    return Array.isArray(items) ? items : undefined;
  } catch {
    return undefined;
  }
}
