import { formatDate, hue, initials, readingTime } from "./posts";

/**
 * Avatar, author, date and reading time of a post.
 *
 * @param {{ post: import("./posts").Post }} props
 */
export default function PostMeta({ post }) {
  return (
    <div class="blog-meta">
      <span class="blog-avatar" style={`--hue: ${hue(post.author)}`} aria-hidden="true">
        {initials(post.author)}
      </span>
      <b>{post.author}</b>
      <span aria-hidden="true">·</span>
      <time datetime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span class="blog-muted">{readingTime(post.body)} min read</span>
    </div>
  );
}
