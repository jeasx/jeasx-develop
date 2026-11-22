/** The columns and rows of the sheet. Shared by the server and the browser. */
export const COLS = ["A", "B", "C", "D"];
export const ROWS = [1, 2, 3, 4, 5, 6, 7, 8];

/** All references of the sheet, row by row: A1, B1, … D8. */
export const REFS = ROWS.flatMap((row) => COLS.map((col) => col + row));

/** The sheet every visitor starts with: a small trip budget. */
export const DEFAULT_CELLS = {
  A1: "Trip budget",
  B1: "Cost",
  C1: "People",
  D1: "Per person",
  A2: "Flights",
  B2: "840",
  C2: "4",
  D2: "=B2/C2",
  A3: "Hotel",
  B3: "1260",
  C3: "4",
  D3: "=B3/C3",
  A4: "Rental car",
  B4: "390",
  C4: "3",
  D4: "=B4/C4",
  A5: "Museums",
  B5: "160",
  C5: "2",
  D5: "=B5/C5",
  A6: "Total",
  B6: "=SUM(B2:B5)",
  D6: "=SUM(D2:D5)",
  A8: "Left of 3000",
  B8: "=3000-B6",
};

/**
 * Keeps only known cells with short inputs, e.g. from a form or a cookie.
 *
 * @param {Record<string, unknown>} input
 * @returns {Record<string, string>}
 */
export function toCells(input) {
  /** @type {Record<string, string>} */
  const cells = {};
  for (const ref of REFS) {
    const value = String(input[ref] ?? "").slice(0, 100);
    if (value.trim()) cells[ref] = value;
  }
  return cells;
}
