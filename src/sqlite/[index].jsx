import formBody from "../@helpers/formBody";
import Layout from "../Layout";
import {
  MAX_MOVIES,
  countMovies,
  createMovie,
  deleteMovie,
  getMovie,
  listMovies,
  seed,
  updateMovie,
} from "./db";

const PATH = "/sqlite";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.method === "POST") {
    const body = formBody(request);
    const id = Number(body["id"]);
    // The anchor the browser scrolls to after the redirect, so the page doesn't jump to the top.
    let anchor = "movies";
    switch (body["action"]) {
      case "create": {
        const movie = toMovie(body);
        if (movie && countMovies() < MAX_MOVIES) {
          anchor = `movie-${createMovie(movie)}`;
        }
        break;
      }
      case "update": {
        const movie = toMovie(body);
        if (movie) {
          updateMovie(id, movie);
        }
        anchor = `movie-${id}`;
        break;
      }
      case "delete":
        deleteMovie(id);
        break;
      case "reset":
        seed();
        // The reset button is at the top, so stay there.
        anchor = "";
        break;
    }
    // 303 makes the browser load the list with GET, so a reload doesn't send the form again.
    return reply.redirect(anchor ? `${PATH}#${anchor}` : PATH, 303);
  }

  const editing = getMovie(Number(request.query["edit"]));
  const movies = listMovies();

  return (
    <Layout
      title="SQLite CRUD"
      description="Create, read, update and delete rows of an in-memory SQLite database with plain HTML forms."
      css="/sqlite/index.css"
      script="/sqlite/index.js"
    >
      <h1>SQLite CRUD</h1>
      <p class="lead">
        Node.js comes with SQLite built in. This example keeps a small movie list in an in-memory
        database, seeded on server start, and changes it with plain HTML forms.
      </p>
      <p>
        Each form posts to this page, which runs a prepared statement and redirects back with{" "}
        <code>303 See Other</code>, so reloading the page never sends a form twice. The database is
        shared by all visitors: <strong>reset</strong> brings back the seed data.
      </p>

      <form method="post" action={PATH} class="toolbar">
        <small class="live">In-memory database, shared by all visitors.</small>
        <button type="submit" name="action" value="reset" class="btn-sm outline secondary">
          Reset to seed data
        </button>
      </form>

      <article>
        <header>
          <h2>Add a movie</h2>
        </header>
        {movies.length < MAX_MOVIES ? (
          <form method="post" action={PATH} class="movie-form">
            <Fields />
            <button type="submit" name="action" value="create">
              Add movie
            </button>
          </form>
        ) : (
          <p>The list is full. Delete a movie or reset the list.</p>
        )}
      </article>

      <article class="movies" id="movies">
        <header>
          <h2>Movies</h2>
          <span class="badge">
            {movies.length} / {MAX_MOVIES}
          </span>
        </header>
        <table>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Year</th>
              <th scope="col">Rating</th>
              <th scope="col" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) =>
              movie.id === editing?.id ? (
                <EditRow movie={movie} />
              ) : (
                <tr id={`movie-${movie.id}`}>
                  <td class="title">{movie.title}</td>
                  <td class="year">
                    <span class="year-pill">{movie.year}</span>
                  </td>
                  <td class="rating">
                    <Stars rating={movie.rating} />
                  </td>
                  <td class="row-actions">
                    <div class="actions">
                      <a
                        href={`?edit=${movie.id}#movie-${movie.id}`}
                        class="btn btn-sm outline icon"
                        aria-label={`Edit ${movie.title}`}
                        title="Edit"
                      >
                        <EditIcon />
                      </a>
                      <form
                        method="post"
                        action={PATH}
                        data-confirm={`Delete “${movie.title}”? This can't be undone.`}
                      >
                        <input type="hidden" name="id" value={movie.id} />
                        <button
                          type="submit"
                          name="action"
                          value="delete"
                          class="btn-sm outline secondary delete icon"
                          aria-label={`Delete ${movie.title}`}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {movies.length === 0 && (
              <tr>
                <td colspan="4" class="empty">
                  No movies left.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </Layout>
  );
}

/**
 * A table row that edits the movie in place: each input sits in its own column.
 * The form lives in the last cell, the inputs join it via their `form` attribute.
 */
function EditRow({ movie }) {
  const form = `edit-${movie.id}`;
  return (
    <tr class="editing" id={`movie-${movie.id}`}>
      <td class="title">
        <input
          type="text"
          name="title"
          value={movie.title}
          required
          maxlength="100"
          aria-label="Title"
          form={form}
        />
      </td>
      <td class="year">
        <input
          type="number"
          name="year"
          value={movie.year}
          required
          min="1888"
          max="2100"
          aria-label="Year"
          form={form}
        />
      </td>
      <td class="rating">
        <RatingSelect rating={movie.rating} form={form} />
      </td>
      <td class="row-actions">
        <div class="actions">
          <form method="post" action={PATH} id={form}>
            <input type="hidden" name="id" value={movie.id} />
            <button
              type="submit"
              name="action"
              value="update"
              class="btn-sm icon"
              aria-label={`Save ${movie.title}`}
              title="Save"
            >
              <SaveIcon />
            </button>
          </form>
          <a
            href={`${PATH}#movie-${movie.id}`}
            class="btn btn-sm outline secondary icon"
            aria-label="Cancel editing"
            title="Cancel"
          >
            <CancelIcon />
          </a>
        </div>
      </td>
    </tr>
  );
}

/** Filled and empty stars, readable as text for screen readers. */
function Stars({ rating }) {
  return (
    <span class="stars" role="img" aria-label={`${rating} of 5 stars`}>
      {"★".repeat(rating)}
      <span class="stars-empty">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/** The inputs for a movie; the browser checks them before sending. */
function Fields({ movie = { title: "", year: 2026, rating: 3 } }) {
  return (
    <>
      <label>
        Title
        <input type="text" name="title" value={movie.title} required maxlength="100" />
      </label>
      <label>
        Year
        <input type="number" name="year" value={movie.year} required min="1888" max="2100" />
      </label>
      <label>
        Rating
        <RatingSelect rating={movie.rating} />
      </label>
    </>
  );
}

/**
 * Checks the form fields again on the server, as forms can be sent without a browser.
 * Returns undefined for invalid input.
 *
 * @param {Record<string, unknown>} body
 */
function toMovie(body) {
  const title = String(body["title"] ?? "").trim();
  const year = Number(body["year"]);
  const rating = Number(body["rating"]);
  if (
    title.length === 0 ||
    title.length > 100 ||
    !Number.isInteger(year) ||
    year < 1888 ||
    year > 2100 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return undefined;
  }
  return { title, year, rating };
}

/** A select for one to five stars. */
function RatingSelect({ rating, form = undefined }) {
  return (
    <select name="rating" aria-label="Rating" form={form}>
      {[1, 2, 3, 4, 5].map((value) => (
        <option value={value} selected={value === rating}>
          {"★".repeat(value)}
        </option>
      ))}
    </select>
  );
}

/** A pencil, drawn in the current text color. */
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" class="icon-svg">
      <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
    </svg>
  );
}

/** A trash can, drawn in the current text color. */
function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" class="icon-svg">
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />
    </svg>
  );
}

/** A check mark, drawn in the current text color. */
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" class="icon-svg">
      <path d="M5 12l5 5L19 7" />
    </svg>
  );
}

/** A cross, drawn in the current text color. */
function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" class="icon-svg">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
