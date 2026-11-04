import Layout from "../../Layout";
import { FIELDS, canStore, createPost, missingFields, readPosts, writePosts } from "../posts";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = /** @type {Record<string, unknown> | undefined} */ (
    request.body && typeof request.body === "object" ? request.body : undefined
  );
  let error = "";

  if (request.method === "POST" && body) {
    const post = createPost(body);
    const posts = readPosts(request);
    // Keep the form filled on errors, so the post can be corrected instead of written again.
    if (missingFields(body).length > 0) {
      error = "Please fill in all fields.";
    } else if (posts.some(({ slug }) => slug === post.slug)) {
      // Otherwise the older post with the same slug could never be opened again.
      error = `A post with the slug "${post.slug}" already exists. Please choose another one.`;
    } else if (!canStore(reply, post)) {
      error = "Your post is too long to be stored in a cookie. Please shorten it.";
    } else {
      posts.unshift(post);
      writePosts(reply, posts);
      // 303 makes the browser load the blog with GET, so a reload doesn't resubmit the form.
      return reply.redirect("/blog", 303);
    }
    reply.status(400);
  }

  /** @param {string} name */
  const value = (name) => String(body?.[name] ?? "");
  // Mark empty required fields after a failed submit, so they stand out.
  const missing = request.method === "POST" && body ? missingFields(body) : [];
  /** @param {string} name */
  const invalid = (name) => (missing.includes(name) ? "true" : undefined);

  return (
    <Layout title="New blog post" robots="noindex" css="/blog/index.css">
      <nav>
        <a href="/blog">← All posts</a>
      </nav>
      <header class="blog-intro">
        <h1>
          Write a <span class="shell-gradient">new post</span>
        </h1>
        <p class="blog-lead">Share an idea. It will be stored in a cookie, only you can see it.</p>
      </header>
      <div class="blog-editor">
        <form method="post" novalidate class="blog-form">
          {error && (
            <p role="alert" class="blog-error">
              ⚠️ {error}
            </p>
          )}
          <label class="blog-field">
            <span class="blog-label">Title</span>
            <input
              type="text"
              name="title"
              class="blog-title-input"
              maxlength={FIELDS.title}
              value={value("title")}
              placeholder="A catchy headline…"
              aria-invalid={invalid("title")}
              required
              autofocus
            />
          </label>
          <label class="blog-field">
            <span class="blog-label">Description</span>
            <input
              type="text"
              name="description"
              maxlength={FIELDS.description}
              value={value("description")}
              placeholder="One or two sentences shown on the overview page"
              aria-invalid={invalid("description")}
              required
            />
            <small>Up to {FIELDS.description} characters</small>
          </label>
          <div class="blog-field-row">
            <label class="blog-field">
              <span class="blog-label">Author</span>
              <input
                type="text"
                name="author"
                maxlength={FIELDS.author}
                value={value("author")}
                placeholder="Your name"
                autocomplete="name"
                aria-invalid={invalid("author")}
                required
              />
            </label>
            <label class="blog-field">
              <span class="blog-label">
                Slug <em>optional</em>
              </span>
              <span class="blog-slug">
                <span aria-hidden="true">/blog/</span>
                <input
                  type="text"
                  name="slug"
                  maxlength={FIELDS.slug}
                  value={value("slug")}
                  placeholder="created-from-the-title"
                />
              </span>
            </label>
          </div>
          <label class="blog-field">
            <span class="blog-label">Body</span>
            <textarea
              name="body"
              class="blog-body-input"
              placeholder="Tell your story… Separate paragraphs with a blank line."
              rows={12}
              maxlength={FIELDS.body}
              aria-invalid={invalid("body")}
              required
            >
              {value("body")}
            </textarea>
            <small>Up to {FIELDS.body} characters</small>
          </label>
          <div class="blog-form-actions">
            <a href="/blog">Cancel</a>
            <button class="btn btn-primary" type="submit">
              🚀 Publish post
            </button>
          </div>
        </form>
        <aside class="blog-tips">
          <h2>Tips</h2>
          <ul>
            <li>
              <b>Paragraphs:</b> leave a blank line between them.
            </li>
            <li>
              <b>HTML</b> is shown as text, so you can safely try <code>&lt;script&gt;</code>.
            </li>
            <li>
              <b>Space is limited:</b> once the cookie is full, the oldest posts are dropped.
            </li>
            <li>
              <b>Clear the cookie</b> on the overview page to get the example posts back.
            </li>
          </ul>
        </aside>
      </div>
    </Layout>
  );
}
