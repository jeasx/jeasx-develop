// The state of the page in the browser, shared by all scripts.
export const state = {
  /**
   * The posts in the feed, newest first. The browser continues with the posts the server rendered.
   * @type {any[]}
   */
  posts: JSON.parse(document.getElementById("initial-posts").textContent),
  /**
   * New posts wait here until the user shows them, so the feed doesn't jump while reading.
   * @type {any[]}
   */
  pending: [],
  /** The active feed filter, or "all". */
  filter: "all",
  /**
   * Unread posts per feed, shown as badges in the feed filter.
   * @type {Record<string, number>}
   */
  unread: {},
  /** Ids of the contacts who are online. */
  online: ["ada", "grace", "tim"],
  /**
   * Latest entries of the live activity, newest first.
   * @type {string[]}
   */
  activity: [],
};

/**
 * Whether a post belongs to the active feed filter.
 *
 * @param {any} post
 */
export const visible = (post) => state.filter === "all" || post.feed === state.filter;

/** @param {string} postId */
export const find = (postId) => state.posts.find((post) => post.id === postId);
