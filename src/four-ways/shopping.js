// The logic of the shopping list, shared by all four versions: the server runs it for
// Jeasx and HTMX, the browser for React and Lit. It has no imports, so it fits everywhere.

/** @typedef {{ id: number, text: string, done: boolean }} Item */

export const MAX_ITEMS = 10;
export const MAX_LENGTH = 40;

/** @type {Item[]} */
export const INITIAL = [
  { id: 1, text: "Bread", done: true },
  { id: 2, text: "Coffee", done: false },
  { id: 3, text: "Apples", done: false },
];

/**
 * Returns the list after an action: "add" (with text), "toggle" or "remove" (with id), "clear".
 *
 * @param {Item[]} items
 * @param {{ action: string, id?: number, text?: string }} change
 * @returns {Item[]}
 */
export function update(items, { action, id, text = "" }) {
  switch (action) {
    case "add": {
      const value = text.trim().slice(0, MAX_LENGTH);
      if (!value || items.length >= MAX_ITEMS) return items;
      const next = Math.max(0, ...items.map((item) => item.id)) + 1;
      return [...items, { id: next, text: value, done: false }];
    }
    case "toggle":
      return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
    case "remove":
      return items.filter((item) => item.id !== id);
    case "clear":
      return items.filter((item) => !item.done);
    default:
      return items;
  }
}

/**
 * Applies a submitted list form: the pressed button names the action, its value the item id.
 * The server runs it for posted forms, the Jeasx version also in the browser.
 *
 * @param {Item[]} items
 * @param {Record<string, unknown>} input
 */
export function reduceForm(items, input) {
  const action = ["add", "toggle", "remove", "clear"].find((name) => input[name] !== undefined);
  return update(items, {
    action: action ?? "",
    id: Number(input[action]),
    text: typeof input.text === "string" ? input.text : "",
  });
}
