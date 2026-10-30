import Layout from "../Layout";
import { readPosts } from "./posts";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const slug = request.path.slice(request.path.lastIndexOf("/") + 1);
  const blog = readPosts(request).find((post) => post.slug === slug);

  if (!blog) {
    return;
  }

  return (
    <Layout title={blog.title} robots={"noindex,nofollow"}>
      <article>
        <header>
          <time>
            {new Date(blog.date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </header>
        <div>
          <h1>{blog.title}</h1>
          <p>{blog.description}</p>
          <p>{blog.body}</p>
        </div>
      </article>
      <section class="center">
        <a href="..">Show all articles</a>
      </section>
    </Layout>
  );
}
