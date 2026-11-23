/**
 * A tiny JSON API: GET lists the books, POST adds one.
 * The books live in memory, so they reset when the server restarts.
 */
const books = [
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt" },
  { id: 2, title: "Eloquent JavaScript", author: "Marijn Haverbeke" },
  { id: 3, title: "Refactoring", author: "Martin Fowler" },
];

/** Everyone shares this list, so it keeps only the newest books. */
const MAX_BOOKS = 20;

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  switch (request.method) {
    case "GET": {
      // Optional search, e.g. "/api-server/books?q=fowler"
      const q = String(request.query["q"] ?? "").toLowerCase();
      return Response.json(
        books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(q)),
      );
    }

    case "POST": {
      const { title, author } = /** @type {any} */ (request.body ?? {});
      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof author !== "string" ||
        !author.trim()
      ) {
        return Response.json({ error: "title and author are required" }, { status: 400 });
      }
      const book = {
        id: Math.max(0, ...books.map((book) => book.id)) + 1,
        title: title.trim().slice(0, 100),
        author: author.trim().slice(0, 100),
      };
      books.push(book);
      if (books.length > MAX_BOOKS) {
        books.shift();
      }
      return Response.json(book, { status: 201 });
    }

    default:
      return Response.json(
        { error: `${request.method} is not allowed` },
        { status: 405, headers: { allow: "GET, POST" } },
      );
  }
}
