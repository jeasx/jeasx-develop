export const MAX_ITEMS = 6;
const MAX_LENGTH = 60;

/**
 * @typedef {{ description: string, quantity: number, price: number }} Item
 * @typedef {{ number: string, customer: string, address: string, items: Item[], vat: number }} Invoice
 */

/** @type {Invoice} */
export const SAMPLE = {
  number: "2026-0042",
  customer: "Ada Lovelace",
  address: "12 Analytical Row\nLondon W1 4EN",
  items: [
    { description: "Website with Jeasx", quantity: 1, price: 2400 },
    { description: "Workshop: Server-side JSX", quantity: 2, price: 650 },
    { description: "Hosting (12 months)", quantity: 12, price: 19.5 },
  ],
  vat: 19,
};

/**
 * Reads an invoice from the query of the form, falling back to the sample.
 * Everything is limited, as the PDF is built from untrusted input.
 *
 * @param {Record<string, unknown>} query
 * @returns {Invoice}
 */
export function parseInvoice(query) {
  if (!query["customer"]) {
    return SAMPLE;
  }
  const list = (key) => [query[key] ?? []].flat().map((value) => String(value));
  const descriptions = list("description");
  const quantities = list("quantity");
  const prices = list("price");
  /** @type {Item[]} */
  const items = [];
  for (let i = 0; i < Math.min(descriptions.length, MAX_ITEMS); i++) {
    const description = text(descriptions[i]);
    if (description) {
      items.push({
        description,
        quantity: number(quantities[i], 0, 9999, 1),
        price: number(prices[i], -1e6, 1e6, 0),
      });
    }
  }
  return {
    number: text(query["number"]) || SAMPLE.number,
    customer: text(query["customer"]),
    address: String(query["address"] ?? "")
      .split(/\r?\n/)
      .map(text)
      .filter(Boolean)
      .slice(0, 4)
      .join("\n"),
    items,
    vat: number(query["vat"], 0, 100, SAMPLE.vat),
  };
}

function text(value) {
  return String(value ?? "")
    .trim()
    .slice(0, MAX_LENGTH);
}

function number(value, min, max, fallback) {
  const string = String(value ?? "").trim();
  // Number("") would be 0, so an empty field gets the fallback instead.
  const parsed = string ? Number(string.replace(",", ".")) : NaN;
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

/** @param {Invoice} invoice */
export function totals({ items, vat }) {
  const net = items.reduce((sum, { quantity, price }) => sum + quantity * price, 0);
  const tax = Math.round(net * vat) / 100;
  return { net, tax, gross: net + tax };
}
