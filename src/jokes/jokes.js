import data from "./jokes.json";

/** Categories with at least one joke, e.g. "general". */
export const CATEGORIES = new Set(data.map(({ type }) => type));

/**
 * @param {string} category
 * @param {number} amount
 */
export default function jokes(category, amount) {
  return pick(category, amount).map(({ setup, punchline }) => `${setup} - ${punchline}`);
}

/**
 * Random jokes with setup and punchline kept apart.
 * @param {string} category
 * @param {number} amount
 * @returns {{ setup: string, punchline: string }[]}
 */
export function pick(category, amount) {
  return shuffle(data.filter(({ type }) => category === type)).slice(0, amount);
}

/**
 * // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {any[]} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
