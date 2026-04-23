import Layout from "./Layout";
import sitemap from "./sitemap.json";

export default function () {
  return (
    <Layout title="The power of Jeasx in examples" description="Welcome to Jeasx - JSX with Ease">
      <section class="container hero hero-primary">
        <h1>Explore Jeasx</h1>
        <p class="hero-tagline">
          Use asynchronous JSX as self-evident templating technology
          <br />
          for the server-side rendered web.
        </p>
        <p>
          Visit <a href="https://www.jeasx.dev">jeasx.dev</a> to learn more about the framework.
        </p>
      </section>
      <section class="container center">
        <p>
          You can find the complete repository on{" "}
          <a href="https://github.com/jeasx/jeasx-expo">GitHub</a> to start experimenting with Jeasx
          right on your computer.
        </p>
        <p>
          The examples are styled with <a href="https://mucss.org/">µCSS</a> (a lightweight, mostly
          classless CSS framework), so they are easier to read in source code.
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
