/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  const number = +body["number"];
  const submit = body["submit"];
  const numbers = !submit && body["numbers"] ? JSON.parse(body["numbers"]) : [];
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
