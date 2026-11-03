import cache from "../@helpers/cache";
import Layout from "../Layout";

// GitHub allows only 10 unauthenticated searches per minute, so keep the results for a while.
const cached = cache({ ttl: 5 * 60_000 });

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  // A repeated parameter arrives as array, so always work with a string.
  // Cut it to the maxlength of the search field, well below GitHub's limit of 256 characters.
  const search = String(request.query["search"] || "jeasx").slice(0, 100);

  return (
    <Layout
      title="Search GitHub repositories"
      description="Search GitHub repositories and stream the results as they arrive."
    >
      <h1 class="center">Search GitHub repositories</h1>
      <p>
        The page is rendered as a stream: the page shell and a loading indicator are sent to the
        browser right away, while the repositories are still fetched from the GitHub API. As soon as
        the results arrive, they are streamed in after the indicator, which is then hidden by a
        single CSS rule. No client-side JavaScript is involved.
      </p>
      <form method="get">
        <input
          type="search"
          name="search"
          placeholder="Search repositories by name..."
          maxlength={100}
          value={search}
        />
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
  // GitHub ignores case when searching, so the cache and the filter do too:
  // "Jeasx" and "jeasx" share one cache entry and one request to GitHub.
  const term = search.toLowerCase();
  const items = await cached(term, () => searchRepositories(term));
  if (!items) {
    return <p>GitHub couldn't be reached right now. Please try again later.</p>;
  }
  // GitHub matches each word on its own, so the filter does too: "react router" finds
  // "remix-run/react-router", although the name doesn't contain the whole phrase.
  const words = term.split(/\s+/).filter(Boolean);
  const repositories = items.filter(({ full_name }) => {
    const name = String(full_name).toLowerCase();
    return term === "jeasx"
      ? name.startsWith(term + "/")
      : words.every((word) => name.includes(word));
  });
  if (repositories.length === 0) {
    return <p>No repositories found. Try another name.</p>;
  }
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
