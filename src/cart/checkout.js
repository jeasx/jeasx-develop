// Runs on the server only: the browser never loads this file, so it can't read the codes,
// and the totals of an order are always computed from the server's own prices.
import { reduce, totals } from "./state";

/**
 * Discount codes are secrets, unlike prices, which are shown on the page anyway.
 * @type {Record<string, Omit<import("./state").Discount, "code">>}
 */
const CODES = {
  SAVE10: { label: "10% off", percent: 10 },
  FREESHIP: { label: "Free shipping", freeShipping: true },
};

/**
 * @param {unknown} code
 * @returns {import("./state").Discount | undefined}
 */
export function findDiscount(code) {
  const key = String(code ?? "")
    .trim()
    .toUpperCase();
  return Object.hasOwn(CODES, key) ? { code: key, ...CODES[key] } : undefined;
}

/**
 * Applies any form to the state on the server: cart changes with the shared reducer,
 * discount codes and orders with the secret codes and the server's prices.
 *
 * @param {import("./state").State} state
 * @param {Record<string, unknown>} input
 * @returns {import("./state").State}
 */
export function checkout(state, input) {
  const next = reduce(state, input);

  if (input["applyCode"] !== undefined) {
    const entered = String(input["code"] ?? "").trim();
    const discount = findDiscount(entered);
    if (discount) {
      return { ...next, discount };
    }
    if (entered) {
      const shown = entered.toUpperCase().slice(0, 20);
      return { ...next, error: `"${shown}" is not a valid code. Try SAVE10 or FREESHIP.` };
    }
  }

  if (input["order"] && next.items.length > 0) {
    // A real shop would charge this total and store the order here.
    const { total, count } = totals(next);
    return { items: [], ordered: { total, count } };
  }

  return next;
}
