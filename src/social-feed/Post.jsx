import { timeAgo } from "./feed";

/** A round avatar with the person's emoji on a tinted background. */
export function Avatar({ person, size = "md" }) {
  return (
    <span class={`avatar ${size}`} style={`--hue: ${person.hue}`} aria-hidden="true">
      {person.avatar}
    </span>
  );
}

/**
 * Simulates loading a link preview, e.g. the Open Graph data of an article.
 * An async component: jsx-async-runtime awaits it on the server and in the browser.
 */
async function LinkPreview({ article }) {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return (
    <a class="preview" href={`https://${article.source}`} rel="nofollow">
      <span class="preview-image" aria-hidden="true">
        {article.tag}
      </span>
      <span class="preview-body">
        <small>{article.source.toUpperCase()}</small>
        <strong>{article.title}</strong>
      </span>
    </a>
  );
}

/** @param {{ post: any }} props */
function Poll({ post }) {
  const total = post.options.reduce(
    (/** @type {number} */ sum, /** @type {any} */ option) => sum + option.votes,
    0,
  );
  return (
    <div class="poll">
      <p class="text">{post.question}</p>
      {post.options.map((/** @type {any} */ option, /** @type {number} */ index) => {
        const percent = total ? Math.round((option.votes / total) * 100) : 0;
        return (
          <button
            type="button"
            class={`option ${post.voted === index ? "chosen" : ""}`}
            data-action="vote"
            data-option={index}
            style={`--percent: ${post.voted === null ? 0 : percent}%`}
            disabled={post.voted !== null}
          >
            <span>{option.label}</span>
            {post.voted !== null && <strong>{percent}%</strong>}
          </button>
        );
      })}
      <small class="muted">{total} votes</small>
    </div>
  );
}

function Weather({ weather }) {
  return (
    <div class="weather">
      <span class="weather-icon" aria-hidden="true">
        {weather.icon}
      </span>
      <div>
        <strong class="temp">{weather.temp}°C</strong>
        <p>
          {weather.text} in {weather.city}
        </p>
      </div>
      <ul>
        {weather.forecast.map((/** @type {any} */ day) => (
          <li>
            <small>{day.day}</small>
            <strong>{day.temp}°</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Event({ post }) {
  const { event } = post;
  const date = new Date(post.time + event.days * 86_400_000);
  return (
    <div class="event">
      <div class="date">
        <small>{date.toLocaleString("en", { month: "short" })}</small>
        <strong>{date.getDate()}</strong>
      </div>
      <div class="event-body">
        <strong>{event.title}</strong>
        <small class="muted">
          📍 {event.place} · {event.going + (post.attending ? 1 : 0)} going
        </small>
      </div>
      <button
        type="button"
        class={`pill ${post.attending ? "active" : ""}`}
        data-action="attend"
        aria-pressed={post.attending ? "true" : "false"}
      >
        {post.attending ? "✓ Going" : "Interested"}
      </button>
    </div>
  );
}

function Content({ post }) {
  switch (post.type) {
    case "status":
      return <p class="text">{post.text}</p>;
    case "photo":
      return (
        <>
          <p class="text">{post.photo.caption}</p>
          <div class={`photo ${post.photo.scene}`} role="img" aria-label={post.photo.caption}>
            {post.photo.emoji}
          </div>
        </>
      );
    case "news":
      return <LinkPreview article={post.article} />;
    case "poll":
      return <Poll post={post} />;
    case "weather":
      return <Weather weather={post.weather} />;
    case "event":
      return <Event post={post} />;
  }
}

/**
 * A post in the feed. The server renders the first page with it, the browser
 * renders every new and every updated post with the very same component.
 */
export default function Post({ post, fresh = false }) {
  const likes = post.likes + (post.liked ? 1 : 0);
  return (
    <article class={`post ${fresh ? "fresh" : ""}`} id={`post-${post.id}`} data-id={post.id}>
      <header>
        <Avatar person={post.author} />
        <div>
          <strong>{post.author.name}</strong>
          <small class="muted">
            <time datetime={new Date(post.time).toISOString()} data-time={post.time}>
              {timeAgo(post.time)}
            </time>{" "}
            · {post.feed}
          </small>
        </div>
      </header>
      <Content post={post} />
      <div class="counts muted">
        <span>{likes > 0 && `👍 ${likes}`}</span>
        <span>
          {post.comments.length > 0 &&
            `${post.comments.length} comment${post.comments.length > 1 ? "s" : ""}`}
        </span>
      </div>
      <div class="actions">
        <button
          type="button"
          class={post.liked ? "liked" : ""}
          data-action="like"
          aria-pressed={post.liked ? "true" : "false"}
        >
          👍 Like
        </button>
        <button type="button" data-action="comment">
          💬 Comment
        </button>
      </div>
      <ul class="comments">
        {post.comments.map((/** @type {any} */ comment) => (
          <li>
            <Avatar person={comment.author} size="sm" />
            <p>
              <strong>{comment.author.name}</strong> {comment.text}
            </p>
          </li>
        ))}
      </ul>
      <form class="reply" data-action="reply">
        <input type="text" name="text" placeholder="Write a comment…" autocomplete="off" />
      </form>
    </article>
  );
}
