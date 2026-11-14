// The server rendered the first page. From here on, the browser renders every
// change with the same JSX components:
// - scripts/state.js: the posts, filter, contacts and activity in the browser
// - scripts/render.jsx: renders posts, feeds, contacts and activity with jsx-async-runtime
// - scripts/live.js: new posts, comments, likes and contacts arriving from the feeds
// - scripts/interactions.js: what the user can do on the page
import { handleComposer, handleFilter, handleNewPosts, handlePosts } from "./scripts/interactions";
import { startLive } from "./scripts/live";

handleNewPosts(document.getElementById("new-posts"));
handleFilter(document.querySelector(".social .left"));
handleComposer(/** @type {HTMLFormElement} */ (document.getElementById("composer")));
handlePosts();
startLive(/** @type {HTMLInputElement} */ (document.getElementById("live")));
