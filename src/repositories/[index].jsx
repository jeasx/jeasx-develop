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
  const search = String(request.query["search"] || "")
    .trim()
    .slice(0, 100);

  return (
    <Layout
      title="Search GitHub repositories"
      description="Search GitHub repositories and stream the results as they arrive."
      css="/repositories/index.css"
    >
      <div class="repos">
        <h1>Search GitHub repositories</h1>
        <p class="lead">
          The page is rendered as a stream: the page shell and a loading indicator are sent to the
          browser right away, while the repositories are still fetched from the GitHub API. As soon
          as the results arrive, they are streamed in after the indicator, which is then hidden by a
          single CSS rule. No client-side JavaScript is involved.
        </p>
        <form method="get" class="search" role="search">
          <input
            type="search"
            name="search"
            placeholder="Search repositories by name…"
            aria-label="Search repositories"
            maxlength={100}
            value={search}
          />
          <button type="submit">Search</button>
        </form>
        {search ? (
          <div class="loader">
            {/* Flushed immediately; hidden via CSS as soon as the results are streamed in after it. */}
            <div aria-busy="true" class="skeletons" aria-label="Loading repositories…">
              {[1, 2, 3].map(() => (
                <div class="skeleton">
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </div>
            <Repositories search={search} />
          </div>
        ) : (
          <p class="notice">
            <span aria-hidden="true">🔍</span> Enter a name to search GitHub repositories.
          </p>
        )}
      </div>
    </Layout>
  );
}

async function Repositories({ search }) {
  // GitHub ignores case when searching, so the cache and the filter do too:
  // "React" and "react" share one cache entry and one request to GitHub.
  const term = search.toLowerCase();
  const items = await cached(term, () => searchRepositories(term));
  if (!items) {
    return (
      <p class="notice">
        <span aria-hidden="true">⚠️</span> GitHub couldn't be reached right now. Please try again
        later.
      </p>
    );
  }
  // GitHub matches each word on its own, so the filter does too: "react router" finds
  // "remix-run/react-router", although the name doesn't contain the whole phrase.
  const words = term.split(/\s+/).filter(Boolean);
  const repositories = items.filter(({ full_name }) => {
    const name = String(full_name).toLowerCase();
    return words.every((word) => name.includes(word));
  });
  // Repositories named exactly like the search come first ("evanw/esbuild" for "esbuild"),
  // the rest keeps GitHub's order by stars.
  const exact = (repo) => String(repo.name).toLowerCase() === term;
  repositories.sort((a, b) => Number(exact(b)) - Number(exact(a)));
  if (repositories.length === 0) {
    return (
      <p class="notice">
        <span aria-hidden="true">🔍</span> No repositories found. Try another name.
      </p>
    );
  }
  return (
    <section>
      <p class="count">
        {repositories.length} {repositories.length === 1 ? "repository" : "repositories"}
      </p>
      <ul class="repo-list">
        {repositories.map((repo, i) => (
          <li style={`--delay: ${Math.min(i, 10) * 40}ms`}>
            <Repository {...repo} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const numberFormat = new Intl.NumberFormat("en", { notation: "compact" });
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function Repository({
  html_url,
  full_name,
  description,
  owner,
  language,
  stargazers_count,
  forks_count,
  updated_at,
}) {
  const updated = updated_at ? new Date(updated_at) : undefined;
  return (
    <article class="repo">
      <header>
        {owner?.avatar_url && (
          <img src={`${owner.avatar_url}&s=64`} alt="" width="32" height="32" loading="lazy" />
        )}
        <a href={html_url}>{full_name}</a>
      </header>
      {description && <p class="repo-description">{description}</p>}
      <footer>
        {language && (
          <span>
            <i class="dot" aria-hidden="true" /> {language}
          </span>
        )}
        <span title="Stars">★ {numberFormat.format(stargazers_count || 0)}</span>
        <span title="Forks">⑂ {numberFormat.format(forks_count || 0)}</span>
        {updated && !isNaN(updated.getTime()) && (
          <time datetime={updated.toISOString()}>Updated {dateFormat.format(updated)}</time>
        )}
      </footer>
    </article>
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
      `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}+in:name&sort=stars`,
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
