import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import { fetchInitialPosts, ME, PEOPLE } from "./feed";
import Post, { Avatar } from "./Post";
import { Activity, Contacts, Feeds } from "./Sidebar";

export default async function () {
  const posts = await fetchInitialPosts();
  return (
    <Layout
      title="Social feed with client-side JSX"
      description="A social network page that keeps updating itself from several content feeds, rendered with jsx-async-runtime in the browser."
      css="/social-feed/index.css"
      script="/social-feed/index.js"
    >
      <h1>Social feed with client-side JSX</h1>
      <p>
        A social network page fed by six simulated content feeds: friends, photos, news, polls,
        weather and events. The server renders the first page, then new posts, comments and
        reactions keep arriving and are rendered in your browser by the very same JSX components
        with <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. News posts
        show a link preview from an <code>async</code> component that simulates loading its data,
        and the runtime waits for it on the server and in the browser alike. Like, comment, vote or
        write a post yourself.
      </p>
      <div class="social">
        <aside class="left">
          <section class="card me">
            <Avatar person={ME} size="lg" />
            <strong>Welcome back!</strong>
            <label class="live">
              <input type="checkbox" id="live" checked /> Live updates
            </label>
          </section>
          <Feeds active="all" counts={{}} />
        </aside>
        <main class="center">
          <form class="card composer" id="composer">
            <Avatar person={ME} />
            <input type="text" name="text" placeholder="What's on your mind?" autocomplete="off" />
            <button type="submit">Post</button>
          </form>
          <button type="button" class="new-posts" id="new-posts" hidden></button>
          <div id="posts">
            {posts.map((post) => (
              <Post post={post} />
            ))}
          </div>
        </main>
        <aside class="right">
          <div id="activity">
            <Activity entries={[]} />
          </div>
          <div id="contacts">
            <Contacts people={PEOPLE} online={["ada", "grace", "tim"]} />
          </div>
        </aside>
      </div>
      {/* The browser continues with the posts the server rendered. "<" is escaped, so no text can end the script. */}
      <script type="application/json" id="initial-posts">
        {html(JSON.stringify(posts).replace(/</g, "\\u003c"))}
      </script>
    </Layout>
  );
}
