import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const q = request.query["q"] || "jeasx";

  const repositories = (
    await (
      await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          q,
        )}+in:name&sort=updated`,
      )
    ).json()
  ).items.filter(({ full_name }) => full_name.includes(q));

  return (
    <Layout title="Search GitHub Repositories" description="A list of repositiories at GitHub.">
      <h1 class="center">Search GitHub Repositories</h1>
      <form method="get">
        <input type="search" name="q" placeholder="Search..." value={q} />
      </form>
      <ul>
        {repositories.map(({ html_url, full_name, description }) => (
          <li>
            <a href={html_url}>{full_name}</a>
            <p>{description}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
