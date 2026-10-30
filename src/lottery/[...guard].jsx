/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  const number = +body["number"];
  const submit = body["submit"];
  const numbers = !submit ? parseNumbers(body["numbers"]) : [];
  let delta = 0;

  if (number) {
    const index = numbers.indexOf(number);
    if (index === -1) {
      numbers.push(number);
      delta = 1;
    } else {
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
    return Array.isArray(numbers) ? numbers.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}
