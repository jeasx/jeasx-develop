/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  const number = +body["number"];
  const submit = body["submit"];
  // Keep the numbers when the results are revealed, so they are shown next to them.
  const numbers = parseNumbers(body["numbers"]);
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

  return { number, delta, numbers, submit };
}

/**
 * Parses the submitted numbers; returns an empty list for invalid input.
 *
 * @param {unknown} value
 * @returns {number[]}
 */
function parseNumbers(value) {
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
