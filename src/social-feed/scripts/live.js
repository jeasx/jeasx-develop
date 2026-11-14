// Live updates from the feeds. Every few seconds something happens: a new
// post arrives, someone comments or likes, or a contact goes on- or offline.
import { fetchPost, PEOPLE, pick, randomComment, timeAgo } from "../feed";
import { log, renderBanner, renderContacts, renderFeeds, showPending, update } from "./render";
import { state } from "./state";

const list = document.getElementById("posts");

async function newPost() {
  const post = await fetchPost();
  state.pending.push(post);
  // Show it right away when the user is at the top, otherwise announce it.
  if (window.scrollY < list.offsetTop) {
    await showPending();
  } else {
    renderBanner();
  }
  if (state.filter !== "all" && post.feed !== state.filter) {
    state.unread = {
      ...state.unread,
      [post.feed]: (state.unread[post.feed] ?? 0) + 1,
    };
    await renderFeeds();
  }
  await log(`${post.author.avatar} ${post.author.name} posted in ${post.feed}`);
}

async function newComment() {
  const post = pick(state.posts);
  const comment = randomComment();
  post.comments = [...post.comments, comment];
  await update(post);
  await log(`💬 ${comment.author.name} commented on ${post.author.name}'s post`);
}

async function newLike() {
  const post = pick(state.posts);
  post.likes += 1;
  await update(post);
  await log(`👍 Someone liked ${post.author.name}'s post`);
}

async function toggleOnline() {
  const person = pick(PEOPLE);
  const wasOnline = state.online.includes(person.id);
  state.online = wasOnline
    ? state.online.filter((id) => id !== person.id)
    : [...state.online, person.id];
  await renderContacts();
  await log(`${wasOnline ? "⚪" : "🟢"} ${person.name} is ${wasOnline ? "offline" : "online"}`);
}

async function tick() {
  const roll = Math.random();
  if (roll < 0.45) {
    await newPost();
  } else if (roll < 0.75) {
    await newComment();
  } else if (roll < 0.9) {
    await newLike();
  } else {
    await toggleOnline();
  }
}

/**
 * Starts the live updates. They pause while the checkbox is unchecked.
 *
 * @param {HTMLInputElement} live
 */
export function startLive(live) {
  // Wait for each update before scheduling the next one.
  async function loop() {
    if (live.checked) {
      await tick();
    }
    setTimeout(loop, 2000 + Math.random() * 3000);
  }
  setTimeout(loop, 2000);

  // Keep the relative times fresh without rendering the posts again.
  setInterval(() => {
    for (const time of list.querySelectorAll("time[data-time]")) {
      time.textContent = timeAgo(Number(/** @type {HTMLElement} */ (time).dataset.time));
    }
  }, 15_000);
}
