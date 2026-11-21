// The catalog, the cart and the price calculation, shared by the server and the browser.
// Prices are integer cents, so the server and the browser compute exactly the same totals.
// The browser only uses them for an instant preview: discount codes and orders are handled
// by the server alone (see "./checkout.js"), which never trusts a price from the browser.

/** @typedef {{ id: string, name: string, emoji: string, price: number }} Product */
/** @typedef {{ id: string, qty: number }} Item */
/** @typedef {{ total: number, count: number }} Order */
/** @typedef {{ code: string, label: string, percent?: number, freeShipping?: boolean }} Discount */
/**
 * @typedef {{
 *   items: Item[],
 *   discount?: Discount,
 *   error?: string,
 *   ordered?: Order,
 * }} State
 */

export const MAX_QTY = 9;
export const VAT_RATE = 0.19;
export const FREE_SHIPPING_FROM = 5000;
export const SHIPPING = 490;

/** @type {Product[]} */
export const PRODUCTS = [
  { id: "coffee", name: "Coffee beans", emoji: "☕", price: 1290 },
  { id: "tea", name: "Green tea", emoji: "🍵", price: 790 },
  { id: "croissant", name: "Croissants (4)", emoji: "🥐", price: 560 },
  { id: "honey", name: "Wildflower honey", emoji: "🍯", price: 990 },
  { id: "chocolate", name: "Dark chocolate", emoji: "🍫", price: 349 },
  { id: "teapot", name: "Teapot", emoji: "🫖", price: 1890 },
];

/** @type {Item[]} */
export const DEFAULT_ITEMS = [
  { id: "coffee", qty: 1 },
  { id: "croissant", qty: 2 },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" });

/** @param {number} cents */
export function formatMoney(cents) {
  return money.format(cents / 100);
}

/** @param {string} id */
export function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

/**
 * Computes all totals of the cart. Prices include VAT, as usual for shops in the EU.
 *
 * @param {State} state
 */
export function totals({ items, discount: discountCode }) {
  const lines = items.flatMap((item) => {
    const product = findProduct(item.id);
    return product ? [{ product, qty: item.qty, sum: product.price * item.qty }] : [];
  });
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.sum, 0);
  const discount = Math.round((subtotal * (discountCode?.percent ?? 0)) / 100);
  const shipping =
    count === 0 || discountCode?.freeShipping || subtotal - discount >= FREE_SHIPPING_FROM
      ? 0
      : SHIPPING;
  const total = subtotal - discount + shipping;
  const vat = Math.round(total - total / (1 + VAT_RATE));
  return { lines, count, subtotal, discount, shipping, total, vat };
}

/** Form fields which only the server can handle, e.g. because it knows the secret codes. */
const SERVER_ACTIONS = ["applyCode", "order"];

/** @param {Record<string, unknown>} input */
export function isServerAction(input) {
  return SERVER_ACTIONS.some((name) => input[name] !== undefined);
}

/**
 * Applies a change of the cart contents to the state. Items are addressed by product id,
 * not position, so a form submitted twice can't change another item.
 *
 * @param {State} state
 * @param {Record<string, unknown>} input
 * @returns {State}
 */
export function reduce(state, input) {
  let items = state.items.map((item) => ({ ...item }));

  /** @param {unknown} id @param {(qty: number) => number} change */
  function setQty(id, change) {
    const productId = String(id);
    if (!findProduct(productId)) {
      return;
    }
    const item = items.find((item) => item.id === productId);
    const qty = Math.min(MAX_QTY, Math.max(0, change(item?.qty ?? 0)));
    if (item) {
      item.qty = qty;
    } else if (qty > 0) {
      items.push({ id: productId, qty });
    }
    items = items.filter((item) => item.qty > 0);
  }

  if (input["add"] || input["increase"]) {
    setQty(input["add"] ?? input["increase"], (qty) => qty + 1);
  }
  if (input["decrease"]) {
    setQty(input["decrease"], (qty) => qty - 1);
  }
  if (input["remove"]) {
    setQty(input["remove"], () => 0);
  }

  // Dropping a discount needs no secret, so the browser can do it right away.
  const discount = input["removeCode"] ? undefined : state.discount;
  return { items, discount };
}

/**
 * The cookie is signed, but could hold a signed value of another cookie,
 * so only keep known products and quantities in range.
 *
 * @param {Record<string, unknown>[]} list
 * @returns {Item[]}
 */
export function toItems(list) {
  return list.flatMap(({ id, qty }) => {
    const quantity = Number(qty);
    return typeof id === "string" &&
      findProduct(id) &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= MAX_QTY
      ? [{ id, qty: quantity }]
      : [];
  });
}
