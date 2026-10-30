import Layout from "../../Layout";
import { createPost, readPosts, writePosts } from "../posts";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method === "POST" && request.body && typeof request.body === "object") {
    const posts = readPosts(request);
    posts.unshift(createPost(request.body));
    writePosts(reply, posts);
    return reply.redirect("/blog");
  }

  return (
    <Layout title="New blog post" robots="noindex">
      <h1>New blog post</h1>
      <form method="post" novalidate>
        <label>
          Slug
          <input type="text" name="slug" required />
        </label>
        <label>
          Title
          <input type="text" name="title" required />
        </label>
        <label>
          Author
          <input type="text" name="author" required />
        </label>
        <label>
          Description
          <input type="text" name="description" required />
        </label>
        <label>
          Body
          <textarea name="body" rows={6} required></textarea>
        </label>
        <button class="btn btn-primary" type="submit">
          Submit Post
        </button>
      </form>
    </Layout>
  );
}
