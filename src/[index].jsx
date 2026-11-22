import Layout from "./Layout";
import sitemap from "./sitemap.json";

const TOPICS = sitemap.flatMap(({ topics }) => topics);
const EXAMPLE_COUNT = TOPICS.reduce((sum, { links }) => sum + links.length, 0);

export default function () {
  return (
    <Layout
      title="The power of Jeasx in examples"
      description="Welcome to Jeasx - JSX with Ease. Explore the framework in examples."
      showHeader={false}
      css="/@styles/home/index.css"
    >
      <section class="home-hero">
        <p class="home-eyebrow">JSX with Ease</p>
        <h1>Explore Jeasx</h1>
        <p class="home-tagline">
          Render pages on the server with async JSX, and run the same components in the browser when
          you need to.
        </p>
        <p class="home-actions">
          <a href="#examples" role="button">
            Browse examples
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
        {TOPICS.map(({ title }) => (
          <a href={`#${slug(title)}`}>{title}</a>
        ))}
      </nav>
      <section class="home-intro">
        <article>
          <h3>Less framework, fewer headaches</h3>
          <p>
            Jeasx keeps its core small: async JSX, file-based routing and little else. Everything
            beyond that is plain code you own and can adapt. These examples show how.
          </p>
        </article>
        <article>
          <h3>Clone and experiment</h3>
          <p>
            All examples are on <a href="https://github.com/jeasx/jeasx-expo">GitHub</a>. Clone the
            repository, run them locally and change the code freely. Every example links to its
            source in the top right corner.
          </p>
        </article>
      </section>
      {sitemap.map((group) => (
        <>
          <header id={group.id} class="home-group">
            <h2>
              {group.title}
              {group.link && (
                <>
                  {" "}
                  <a href={group.link.href} class="home-runtime">
                    {group.link.text}
                  </a>
                </>
              )}
            </h2>
            <p class="home-group-intro">{group.intro}</p>
          </header>
          {group.topics.map(({ title, description, links }) => (
            <section id={slug(title)} class="home-topic">
              <header>
                <span class="home-number">
                  {String(TOPICS.findIndex((topic) => topic.title === title) + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{title}</h3>
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
        </>
      ))}
    </Layout>
  );
}

/** @param {string} title */
function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
