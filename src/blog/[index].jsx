import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import Layout from "../Layout";
import PostMeta from "./PostMeta";
import { clearPosts, hasOwnPosts, hue, readPosts } from "./posts";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // The "Clear cookie" form posts here.
  if (request.method === "POST") {
    if (isCrossSite(request)) {
      return crossSiteResponse();
    }
    clearPosts(reply);
    // 303 makes the browser load the blog with GET, so a reload doesn't resubmit the form.
    return reply.redirect("/blog", 303);
  }

  const [featured, ...posts] = readPosts(request);

  return (
    <Layout
      title="Blog"
      description="A simple blog built with Jeasx which stores its posts in a cookie."
      css="/blog/index.css"
    >
      <section class="blog-intro">
        <h1>
          The <span class="shell-gradient">Jeasx</span> Blog
        </h1>
        <p class="blog-lead">
          An overview page, a page per post and a protected form to write new posts. To keep the
          example free of a database, new posts are stored in a cookie in your browser, so only you
          can see them.
        </p>
        <div class="blog-actions">
          <a href="/blog/post" rel="nofollow" class="btn btn-primary">
            ✍️ Write a new post
          </a>
          <span class="blog-hint">
            Username and password: <code>demo</code>
          </span>
        </div>
      </section>

      <div class="blog-grid">
        {featured && (
          <article class="blog-card blog-featured">
            <div class="blog-cover" style={`--hue: ${hue(featured.slug)}`}></div>
            <div class="blog-featured-text">
              <span class="blog-badge">Latest</span>
              <h2>
                <a href={featured.slug}>{featured.title}</a>
              </h2>
              <p>{featured.description}</p>
              <PostMeta post={featured} />
            </div>
          </article>
        )}
        {posts.map((post) => (
          <article class="blog-card">
            <div class="blog-cover" style={`--hue: ${hue(post.slug)}`}></div>
            <h3>
              <a href={post.slug}>{post.title}</a>
            </h3>
            <p>{post.description}</p>
            <PostMeta post={post} />
          </article>
        ))}
      </div>

      <section class="blog-storage">
        <div>
          <h2>🍪 Where are my posts?</h2>
          <p>
            This blog has no database. Posts you write are stored in a signed cookie in your
            browser, so nobody else can see them. Cookies hold only about 4 KB, so the oldest posts
            are dropped once it is full.{" "}
            {hasOwnPosts(request)
              ? "Clear the cookie to delete your posts and get the example posts back."
              : "You are seeing the example posts, since you haven't written a post yet."}
          </p>
        </div>
        {hasOwnPosts(request) && (
          <form method="post">
            <button type="submit" class="btn btn-secondary">
              Clear cookie
            </button>
          </form>
        )}
      </section>
    </Layout>
  );
}
