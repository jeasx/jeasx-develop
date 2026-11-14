// The cinema: shared by the server and the browser.

export const SCREENINGS = [
  { id: "nebula", title: "Nebula Drift", time: "17:30", poster: "🪐" },
  { id: "tides", title: "Under the Tides", time: "20:00", poster: "🌊" },
  { id: "neon", title: "Neon Alley", time: "22:45", poster: "🌃" },
];

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const SEATS_PER_ROW = 12;
export const MAX_SEATS = 6;

/** Seats after an aisle get some space before them. */
export const AISLES_BEFORE = [4, 10];

/** Wheelchair spaces in the last row. */
export const WHEELCHAIR = ["H1", "H2", "H11", "H12"];

export const TIERS = {
  front: { label: "Front", price: 8 },
  standard: { label: "Standard", price: 11 },
  premium: { label: "Premium", price: 14 },
};

/** @param {string} row */
export function tierOf(row) {
  return row <= "B" ? "front" : row <= "F" ? "standard" : "premium";
}

/** @param {number} amount */
export function formatPrice(amount) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "EUR" });
}

/**
 * @typedef {{ id: string, number: number, tier: string, wheelchair: boolean,
 *   status: "free" | "taken" | "selected" | "yours" }} Seat
 * @typedef {{ screening: typeof SCREENINGS[number], seats: { id: string, tier: string, price: number }[],
 *   total: number, booked: string[], message: string }} Selection
 */

/**
 * What components need from a store: the server and the browser store both offer it.
 * @typedef {{ renderer: string, screening: () => Promise<typeof SCREENINGS[number]>,
 *   seats: (row: string) => Promise<Seat[]>, selection: () => Promise<Selection> }} Store
 * @typedef {{ store: Store }} StoreContext
 */
