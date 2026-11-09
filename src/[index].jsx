import Layout from "./Layout";
import sitemap from "./sitemap.json";

const EXAMPLE_COUNT = sitemap.reduce((sum, { links }) => sum + links.length, 0);

/** @param {string} title */
const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function () {
  return (
    <Layout
      title="The power of Jeasx in examples"
      description="Welcome to Jeasx - JSX with Ease. Explore the framework in examples."
    >
      <section class="home-hero">
        <p class="home-eyebrow">JSX with Ease</p>
        <h1>Explore Jeasx</h1>
        <p class="home-tagline">
          Use asynchronous JSX as an intuitive templating language for the server-side rendered web.
        </p>
        <p class="home-actions">
          <a href="#examples" role="button">
            Browse {EXAMPLE_COUNT} examples
          </a>
          <a href="https://www.jeasx.dev" role="button" class="outline">
            Visit jeasx.dev
          </a>
        </p>
        <ul class="home-stats">
          <li>
            <strong>{EXAMPLE_COUNT}</strong> examples
          </li>
          <li>
            <strong>100%</strong> HTML first
          </li>
          <li>
            <strong>0</strong> magic
          </li>
        </ul>
      </section>

      <nav id="examples" class="home-topics" aria-label="Topics">
        {sitemap.map(({ title }) => (
          <a href={`#${slug(title)}`}>{title}</a>
        ))}
      </nav>

      <section class="home-intro">
        <article>
          <h3>Less framework, fewer headaches</h3>
          <p>
            Jeasx keeps its core small: asynchronous JSX on the server, file-based routing, and
            little else. Everything beyond that is integrated in userland with code you own and can
            adapt.
          </p>
        </article>
        <article>
          <h3>Run it yourself</h3>
          <p>
            All examples are on <a href="https://github.com/jeasx/jeasx-expo">GitHub</a>. Clone the
            repository to run them locally. Every example links to its source in the top right
            corner. Change the code freely and see what happens.
          </p>
        </article>
      </section>

      {sitemap.map(({ title, description, links }, index) => (
        <section id={slug(title)} class="home-topic">
          <header>
            <span class="home-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </header>
          <div class="home-grid">
            {links.map(({ title, path }) => (
              <a href={path} class="home-tile">
                <strong>{title}</strong>
                <code>{path}</code>
              </a>
            ))}
          </div>
        </section>
      ))}
    </Layout>
  );
}
