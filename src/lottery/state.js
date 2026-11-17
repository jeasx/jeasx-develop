// The state and its changes, shared by the server ("./[...guard].jsx") and the browser ("./index.jsx").

/** @typedef {{ numbers: number[], number: number, revealed: boolean }} State */

/** @type {State} */
export const INITIAL = { numbers: [], number: 0, revealed: false };

/**
 * Applies a submitted form to the state.
 *
 * @param {State} state
 * @param {Record<string, unknown>} input
 * @returns {State}
 */
export function reduce(state, input) {
  if (input["intent"] === "restart") {
    return INITIAL;
  }
  const number = Number(input["number"]);
  // Keep the numbers when the results are revealed, so they are shown next to them.
  const numbers = [...state.numbers];
  let changed = false;
  if (isValidNumber(number)) {
    const index = numbers.indexOf(number);
    if (index === -1 && numbers.length < 6) {
      numbers.push(number);
      changed = true;
    } else if (index !== -1) {
      numbers.splice(index, 1);
      changed = true;
    }
  }
  // Only remember the number if it changed the picks, so the view can tell what happened.
  return {
    numbers,
    number: changed ? number : 0,
    revealed: input["intent"] === "reveal" && numbers.length === 6,
  };
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isValidNumber(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 49;
}
