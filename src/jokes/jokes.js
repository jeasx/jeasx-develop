import data from "./jokes.json";

/**
 * @param {string} category
 * @param {number} amount
 */
export default function jokes(category, amount) {
  return shuffle(data.filter(({ type }) => category === type))
    .map(({ setup, punchline }) => `${setup} - ${punchline}`)
    .slice(0, amount);
}

/**
 * // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {any[]} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
