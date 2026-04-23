import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const { slug } = new URLPattern({
    pathname: "/*/:slug",
  }).exec(`${request.protocol}://${request.host}${request.path}`).pathname.groups;
  const blog = JSON.parse(request.cookies["posts"] || "[]").find((post) => post.slug === slug);
  if (!blog) {
    reply.status(404);
    return;
  }

  return (
    <Layout title={blog.title} robots={"noindex,nofollow"}>
      <article>
        <header>
          <time>
            {new Date(blog.date).toLocaleDateString("en-EN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </header>
        <main>
          <h1>{blog.title}</h1>
          <p>{blog.description}</p>
          <p>{blog.body}</p>
        </main>
      </article>
      <section class="center">
        <a href="..">Show all articles</a>
      </section>
    </Layout>
  );
}
