import Layout from "./Layout";
import sitemap from "./sitemap.json";

export default function () {
  return (
    <Layout
      title="The power of Jeasx in examples"
      description="Welcome to Jeasx - JSX with Ease. Explore the framework in examples."
    >
      <section class="container hero hero-primary">
        <h1>Explore Jeasx</h1>
        <p class="hero-tagline">
          Use asynchronous JSX as an intuitive templating language
          <br />
          for the server-side rendered web.
        </p>
        <p>
          Visit <a href="https://www.jeasx.dev">jeasx.dev</a> to learn more about the framework.
        </p>
      </section>
      <section class="container center">
        <p>
          The source code of all examples is on{" "}
          <a href="https://github.com/jeasx/jeasx-expo">GitHub</a>: clone it to run them on your own
          computer and start experimenting. Every example links to its source in the top right
          corner.
        </p>
        <p>
          The examples are styled with <a href="https://mucss.org/">µCSS</a>, a lightweight and
          mostly classless CSS framework, so their markup stays short and easy to read.
        </p>
      </section>
      <section class="container center">
        {sitemap.map(({ title, description, links }) => (
          <article class="card-secondary">
            <h2>{title}</h2>
            <p>{description}</p>
            <div class="row center">
              {links.map(({ title, path }) => (
                <a href={path} class="col-12 col-md-3">
                  <article class="card-primary">{title}</article>
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>
    </Layout>
  );
}
