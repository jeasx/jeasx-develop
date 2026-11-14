/**
 * The store in the browser: it loads the tasks of a column from the API.
 * Components only see `tasks(status)`, the same method the server store offers
 * (see "./server.js"), so they don't know where they are rendered.
 */
export const browserStore = {
  renderer: "browser",

  /** @param {string} status */
  async tasks(status) {
    const response = await fetch(`/kanban/api?status=${encodeURIComponent(status)}`);
    if (!response.ok) {
      throw new Error(`Loading "${status}" failed: ${response.status}`);
    }
    return await response.json();
  },
};
