import { DatabaseSync } from "node:sqlite";

const SEED = [
  ["Metropolis", 1927, 5],
  ["Modern Times", 1936, 4],
  ["Casablanca", 1942, 4],
  ["Rashomon", 1950, 4],
  ["Seven Samurai", 1954, 5],
  ["Vertigo", 1958, 4],
  ["2001: A Space Odyssey", 1968, 5],
  ["Alien", 1979, 4],
  ["Blade Runner", 1982, 4],
  ["Back to the Future", 1985, 3],
  ["Groundhog Day", 1993, 3],
  ["The Matrix", 1999, 4],
  ["Spirited Away", 2001, 5],
  ["Amélie", 2001, 3],
  ["Parasite", 2019, 5],
];

/** Keeps the shared demo database small, as every visitor can add movies. */
export const MAX_MOVIES = 50;

// An in-memory database: it starts fresh on every server start and is shared by all visitors.
// Kept on globalThis, as the development server may load this module again on each request
// (e.g. on Bun), which would otherwise create a new, freshly seeded database every time.
const db = (globalThis.sqliteDatabase ??= createDatabase());

function createDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE movies (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
    )
  `);
  const insert = database.prepare("INSERT INTO movies (title, year, rating) VALUES (?, ?, ?)");
  for (const movie of SEED) {
    insert.run(...movie);
  }
  return database;
}

// Prepared when the module loads, run many times.
// Values are bound as parameters, never concatenated into SQL.
const statements = {
  list: db.prepare("SELECT * FROM movies ORDER BY year"),
  get: db.prepare("SELECT * FROM movies WHERE id = ?"),
  count: db.prepare("SELECT COUNT(*) AS count FROM movies"),
  insert: db.prepare("INSERT INTO movies (title, year, rating) VALUES (?, ?, ?)"),
  update: db.prepare("UPDATE movies SET title = ?, year = ?, rating = ? WHERE id = ?"),
  remove: db.prepare("DELETE FROM movies WHERE id = ?"),
  clear: db.prepare("DELETE FROM movies"),
};

/** @typedef {{ id: number, title: string, year: number, rating: number }} Movie */

/** Replaces all movies with the seed data. */
export function seed() {
  statements.clear.run();
  for (const movie of SEED) {
    statements.insert.run(...movie);
  }
}

/** @returns {Movie[]} */
export function listMovies() {
  return /** @type {any} */ (statements.list.all());
}

/** @returns {Movie | undefined} */
export function getMovie(id) {
  return /** @type {any} */ (statements.get.get(id));
}

/** @returns {number} */
export function countMovies() {
  return Number(statements.count.get().count);
}

/** @returns {number} The id of the new movie. */
export function createMovie({ title, year, rating }) {
  return Number(statements.insert.run(title, year, rating).lastInsertRowid);
}

export function updateMovie(id, { title, year, rating }) {
  statements.update.run(title, year, rating, id);
}

export function deleteMovie(id) {
  statements.remove.run(id);
}
