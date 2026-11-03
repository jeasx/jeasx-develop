import Layout from "../Layout";
import { readPosts } from "./posts";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const posts = readPosts(request);

  return (
    <Layout
      title="Blog"
      description="A simple blog built with Jeasx which stores its posts in a cookie."
    >
      <h1>Blog</h1>
      <p>
        A small blog built with Jeasx: an overview page, a page per post and a protected form to
        write new posts. To keep the example free of a database, new posts are stored in a cookie in
        your browser, so only you can see them. A real blog would load its posts from a database or
        a CMS instead.
      </p>
      <section class="center">
        <article class="card-primary">
          <a href="/blog/post" rel="nofollow">
            Write a new post
          </a>
          <br />
          Username and password: demo
        </article>
      </section>
      {posts.map(({ slug, date, author, title }) => (
        <article>
          <header>
            <time>
              {new Date(date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </header>
          <div>
            <h2 style="text-align: left">
              <a href={slug}>{title}</a>
            </h2>
          </div>
          <footer>{author}</footer>
        </article>
      ))}
    </Layout>
  );
}
