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
    } else if (!canStore(post)) {
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

  return (
    <Layout title="New blog post" robots="noindex">
      <h1>New blog post</h1>
      {error && <p role="alert">{error}</p>}
      <form method="post" novalidate>
        <label>
          Slug
          <input
            type="text"
            name="slug"
            maxlength={FIELDS.slug}
            value={value("slug")}
            placeholder="Leave empty to create it from the title"
          />
        </label>
        <label>
          Title
          <input
            type="text"
            name="title"
            maxlength={FIELDS.title}
            value={value("title")}
            required
          />
        </label>
        <label>
          Author
          <input
            type="text"
            name="author"
            maxlength={FIELDS.author}
            value={value("author")}
            required
          />
        </label>
        <label>
          Description
          <input
            type="text"
            name="description"
            maxlength={FIELDS.description}
            value={value("description")}
            required
          />
        </label>
        <label>
          Body
          <textarea name="body" rows={6} maxlength={FIELDS.body} required>
            {value("body")}
          </textarea>
        </label>
        <button class="btn btn-primary" type="submit">
          Submit Post
        </button>
      </form>
    </Layout>
  );
}
