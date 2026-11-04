import Layout from "../Layout";
import PostMeta from "./PostMeta";
import { hue, paragraphs, readPosts } from "./posts";

// Only answer "/blog/<slug>", not deeper paths like "/blog/a/b/<slug>".
const SLUG_PATTERN = new URLPattern({ pathname: "/blog/:slug{/}?" });

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const slug = SLUG_PATTERN.exec({ pathname: request.path })?.pathname.groups.slug;
  const posts = readPosts(request);
  const index = slug ? posts.findIndex((post) => post.slug === slug) : -1;

  // The post doesn't exist: let [404] answer.
  if (index === -1) {
    return;
  }

  const post = posts[index];
  // Posts are sorted from newest to oldest.
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return (
    <Layout
      title={post.title}
      description={post.description}
      robots="noindex,nofollow"
      css="/blog/index.css"
    >
      <nav>
        <a href="..">← All posts</a>
      </nav>
      <article class="blog-post">
        <header class="blog-post-header">
          <h1>{post.title}</h1>
          <p class="blog-description">{post.description}</p>
          <PostMeta post={post} />
        </header>
        <div class="blog-cover" style={`--hue: ${hue(post.slug)}`}></div>
        <div class="blog-body">
          {paragraphs(post.body).map((text) => (
            <p>{text}</p>
          ))}
        </div>
        <footer class="blog-post-footer">
          {older && (
            <a href={`../${older.slug}`}>
              <small>← Older</small>
              {older.title}
            </a>
          )}
          {newer && (
            <a href={`../${newer.slug}`} class="blog-next">
              <small>Newer →</small>
              {newer.title}
            </a>
          )}
        </footer>
      </article>
    </Layout>
  );
}
