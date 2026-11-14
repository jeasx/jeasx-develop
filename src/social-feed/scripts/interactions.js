// What the user can do: filter feeds, write posts, like, vote, attend and comment.
import { id, ME, randomComment } from "../feed";
import { log, renderBanner, renderFeeds, renderList, showPending, update } from "./render";
import { find, state } from "./state";

const list = document.getElementById("posts");

/** Shows the waiting posts when the "new posts" button is clicked. */
export function handleNewPosts(/** @type {HTMLElement} */ button) {
  button.addEventListener("click", async () => {
    await showPending();
    window.scrollTo({ top: list.offsetTop - 120, behavior: "smooth" });
  });
}

/** Switches the feed filter. */
export function handleFilter(/** @type {HTMLElement} */ sidebar) {
  sidebar.addEventListener("click", async (event) => {
    const button = /** @type {Element} */ (event.target).closest("[data-feed]");
    if (!(button instanceof HTMLElement)) {
      return;
    }
    state.filter = button.dataset.feed;
    state.unread = { ...state.unread, [state.filter]: 0 };
    await Promise.all([renderList(), renderFeeds()]);
    renderBanner();
  });
}

/** Publishes your own post; friends react to it after a moment. */
export function handleComposer(/** @type {HTMLFormElement} */ composer) {
  composer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = /** @type {HTMLInputElement} */ (composer.elements.namedItem("text"));
    const text = input.value.trim();
    if (!text) {
      return;
    }
    input.value = "";
    const post = {
      id: id(),
      feed: "friends",
      type: "status",
      time: Date.now(),
      author: ME,
      text,
      likes: 0,
      liked: false,
      comments: [],
    };
    state.pending.push(post);
    await showPending();
    setTimeout(async () => {
      post.likes += 1 + Math.floor(Math.random() * 3);
      post.comments = [...post.comments, randomComment()];
      await update(post);
      await log(`🎉 Your friends reacted to your post`);
    }, 2500);
  });
}

/** Buttons and comment forms inside the posts. */
export function handlePosts() {
  list.addEventListener("click", async (event) => {
    const target = /** @type {Element} */ (event.target);
    // The link previews point to made-up domains.
    if (target.closest(".preview")) {
      event.preventDefault();
    }
    const button = target.closest("[data-action]");
    const article = target.closest(".post");
    if (!(button instanceof HTMLElement) || !(article instanceof HTMLElement)) {
      return;
    }
    const post = find(article.dataset.id);
    if (!post) {
      return;
    }
    switch (button.dataset.action) {
      case "like":
        post.liked = !post.liked;
        break;
      case "vote": {
        const option = Number(button.dataset.option);
        post.options = post.options.with(option, {
          ...post.options[option],
          votes: post.options[option].votes + 1,
        });
        post.voted = option;
        break;
      }
      case "attend":
        post.attending = !post.attending;
        break;
      case "comment":
        /** @type {HTMLElement} */ (article.querySelector(".reply input")).focus();
        return;
      default:
        return;
    }
    await update(post);
  });

  list.addEventListener("submit", async (event) => {
    const form = /** @type {HTMLFormElement} */ (event.target);
    event.preventDefault();
    const article = /** @type {HTMLElement} */ (form.closest(".post"));
    const post = find(article.dataset.id);
    const input = /** @type {HTMLInputElement} */ (form.elements.namedItem("text"));
    const text = input.value.trim();
    if (!post || !text) {
      return;
    }
    input.value = "";
    post.comments = [...post.comments, { id: id(), author: ME, text }];
    await update(post);
    /** @type {HTMLElement} */ (document.querySelector(`#post-${post.id} .reply input`)).focus();
  });
}
