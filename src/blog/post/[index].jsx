import Layout from "../../Layout";
import { FIELDS, canStore, createPost, readPosts, writePosts } from "../posts";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = request.body && typeof request.body === "object" ? request.body : undefined;
  let error = "";

  if (request.method === "POST" && body) {
    const post = createPost(body);
    if (canStore(post)) {
      const posts = readPosts(request);
      posts.unshift(post);
      writePosts(reply, posts);
      // 303 makes the browser load the blog with GET, so a reload doesn't resubmit the form.
      return reply.redirect("/blog", 303);
    }
    // Keep the form filled, so the post can be shortened instead of written again.
    reply.status(400);
    error = "Your post is too long to be stored in a cookie. Please shorten it.";
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
          <input type="text" name="slug" maxlength={FIELDS.slug} value={value("slug")} required />
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
