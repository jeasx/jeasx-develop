// The state and its changes, shared by the server ("./[...guard].jsx") and the browser ("./index.jsx").

/** @typedef {{ numbers: number[], number: number, delta: number, submit: boolean }} State */

/** @type {State} */
export const INITIAL = { numbers: [], number: 0, delta: 0, submit: false };

/**
 * Applies a submitted form to the state.
 *
 * @param {State} state
 * @param {Record<string, unknown>} input
 * @returns {State}
 */
export function reduce(state, input) {
  if (input["restart"]) {
    return INITIAL;
  }
  const number = Number(input["number"]);
  // Keep the numbers when the results are revealed, so they are shown next to them.
  const numbers = [...state.numbers];
  let delta = 0;
  if (isValidNumber(number)) {
    const index = numbers.indexOf(number);
    if (index === -1 && numbers.length < 6) {
      numbers.push(number);
      delta = 1;
    } else if (index !== -1) {
      numbers.splice(index, 1);
      delta = -1;
    }
  }
  return { numbers, number, delta, submit: Boolean(input["submit"]) };
}

/**
 * Parses the submitted numbers; returns an empty list for invalid input.
 *
 * @param {unknown} value
 * @returns {number[]}
 */
export function parseNumbers(value) {
  try {
    const numbers = JSON.parse(String(value));
    return Array.isArray(numbers) ? [...new Set(numbers.filter(isValidNumber))].slice(0, 6) : [];
  } catch {
    return [];
  }
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isValidNumber(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 49;
}
