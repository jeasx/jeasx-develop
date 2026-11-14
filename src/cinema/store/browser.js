/**
 * The store in the browser: it loads every part from the API. Components only see
 * `screening()`, `seats(row)` and `selection()`, the same methods the server store
 * offers (see "./server.js"), so they don't know where they are rendered.
 *
 * @type {import("../screenings").Store}
 */
export const browserStore = {
  renderer: "browser",
  screening: () => load({ part: "screening" }),
  seats: (row) => load({ part: "row", row }),
  selection: () => load({ part: "summary" }),
};

/** @param {Record<string, string>} params */
async function load(params) {
  const response = await fetch(`/cinema/api?${new URLSearchParams(params)}`);
  if (!response.ok) {
    throw new Error(`Loading ${params.part} failed: ${response.status}`);
  }
  return await response.json();
}
