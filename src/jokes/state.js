// The state and its changes, shared by the server ("./[index].jsx") and the browser ("./index.jsx").

/** @typedef {{ setup: string, punchline: string }} Joke */
/** @typedef {{ counter: number, category?: string, jokes: Joke[] }} State */
/** @typedef {(category: string, amount: number) => Joke[] | Promise<Joke[]>} Pick */

export const CATEGORIES = [
  { value: "programming", icon: "🤓", one: "a nerd joke", many: "nerd jokes" },
  { value: "general", icon: "🥁", one: "a pun", many: "puns" },
];

/** @type {State} */
export const INITIAL = { counter: 3, jokes: [] };

/**
 * Applies a form submission to the state. The server picks jokes directly,
 * the browser fetches them (see "./[pick].js"), so it doesn't load all jokes up front.
 *
 * @param {State} state
 * @param {Record<string, unknown>} input
 * @param {Pick} pick
 * @returns {Promise<State>}
 */
export async function reduce(state, input, pick) {
  // The -/+ buttons send "change"; the counter comes from the state.
  const change = input["change"] === "-1" ? -1 : input["change"] === "1" ? 1 : 0;
  const counter = clamp(state.counter + change);
  const category = CATEGORIES.find(({ value }) => value === input["category"])?.value;
  // Only a category button picks jokes; the -/+ buttons clear them, like the plain form does.
  const jokes = category ? await pick(category, counter) : [];
  return { counter, category, jokes };
}

/** Keeps the number of jokes between 1 and 5, even for tampered form fields. */
export function clamp(value) {
  return Math.min(Math.max(Math.trunc(Number(value)) || 3, 1), 5);
}
