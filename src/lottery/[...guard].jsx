import { INITIAL, parseNumbers, reduce } from "./state";

/**
 * Without JavaScript, the picked numbers travel in a hidden field of the form.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // A JSON body can also be a number or string, which the reducer can't handle.
  const body = /** @type {Record<string, unknown>} */ (
    request.body && typeof request.body === "object" ? request.body : {}
  );
  return reduce({ ...INITIAL, numbers: parseNumbers(body["numbers"]) }, body);
}
