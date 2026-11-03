import Layout from "../Layout";
import { readPosts } from "./posts";

// Only answer "/blog/<slug>", not deeper paths like "/blog/a/b/<slug>".
const SLUG_PATTERN = new URLPattern({ pathname: "/blog/:slug{/}?" });

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const slug = SLUG_PATTERN.exec({ pathname: request.path })?.pathname.groups.slug;
  const blog = slug && readPosts(request).find((post) => post.slug === slug);

  if (!blog) {
    return;
  }

  return (
    <Layout title={blog.title} description={blog.description} robots="noindex,nofollow">
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
