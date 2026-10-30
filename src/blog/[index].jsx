import Layout from "../Layout";
import data from "./data.json";
import { readPosts, writePosts } from "./posts";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const posts = readPosts(request, data);
  writePosts(reply, posts);

  return (
    <Layout title="Blog example with Jeasx">
      <h1>Blog example</h1>
      <p>
        This example shows how to create a blog using Jeasx. Please note that the blog content is
        stored in a browser cookie. While this approach eliminates the need for a database, it is
        not suitable for a real-world blog.
      </p>
      <section class="center">
        <article class="card-primary">
          <a href="/blog/post" rel="nofollow">
            Submit new post
          </a>
          <br />
          Login: demo/demo
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
