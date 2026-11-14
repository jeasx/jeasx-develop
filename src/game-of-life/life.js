export const COLS = 64;
export const ROWS = 24;

/** A glider gun would not fit, so the board starts with a few gliders and an R-pentomino. */
const PATTERN = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2], // glider
  [11, 3],
  [12, 4],
  [10, 5],
  [11, 5],
  [12, 5], // glider
  [20, 11],
  [21, 11],
  [19, 12],
  [20, 12],
  [20, 13], // R-pentomino
];

/** The board is a flat array of booleans, row by row. */
export function initialCells() {
  const cells = Array.from({ length: COLS * ROWS }, () => false);
  for (const [x, y] of PATTERN) cells[y * COLS + x] = true;
  return cells;
}

export function randomCells(density = 0.25) {
  return Array.from({ length: COLS * ROWS }, () => Math.random() < density);
}

/**
 * Computes the next generation. The edges wrap around, so the board is a torus.
 *
 * @param {boolean[]} cells
 * @returns {boolean[]}
 */
export function step(cells) {
  return cells.map((alive, index) => {
    const x = index % COLS;
    const y = Math.floor(index / COLS);
    let neighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((dx || dy) && cells[((y + dy + ROWS) % ROWS) * COLS + ((x + dx + COLS) % COLS)]) {
          neighbors++;
        }
      }
    }
    return neighbors === 3 || (alive && neighbors === 2);
  });
}
