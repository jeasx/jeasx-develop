import { fitsCookie, readListCookie } from "../cookies";
import Layout from "../Layout";
import { loadRecipes } from "../mdx/recipes";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (request.headers["fx-request"] === "true") {
    return <Fragment request={request} reply={reply} />;
  }

  return (
    <Layout
      title="Fixi.js and Jeasx - lightweight hypermedia controls"
      description="Jeasx integrates easily with Fixi.js"
      script="/fixi/index.js"
    >
      <h1>Fixi.js and Jeasx - lightweight hypermedia controls</h1>
      <p>
        <a href="https://github.com/bigskysoftware/fixi">Fixi.js</a> is a minimalist alternative to
        HTMX, developed by the creators of HTMX. Enhancing a server-rendered Jeasx application with
        Fixi.js works without problems. The example illustrates progressive enhancement: it provides
        an improved user experience with JavaScript while remaining fully functional as a fallback
        without it.
      </p>
      <h2>Recipe editor</h2>
      <Fragment request={request} reply={reply} />
    </Layout>
  );
}

const MAX_ENTRIES = 10;
const MAX_LENGTH = 50;

// Start loading right away, so the first visitor doesn't have to wait as long.
loadRecipes();

/**
 * Reads the visitor's recipes from the cookie; falls back to the recipes from the API
 * (or an empty list if it is unavailable) if the cookie is missing or malformed.
 *
 * @param {string | undefined} cookie
 */
async function readEntries(cookie) {
  return (readListCookie(cookie) ?? (await loadRecipes())).slice(0, MAX_ENTRIES).map(toEntry);
}

/** @param {Record<string, unknown>} value */
function toEntry({ name, cuisine, difficulty }) {
  return { name: toText(name), cuisine: toText(cuisine), difficulty: toText(difficulty) };
}

/** @param {unknown} value */
function toText(value) {
  return String(value ?? "").slice(0, MAX_LENGTH);
}

/**
 * @param {import("../types").RouteProps} props
 */
async function Fragment({ request, reply }) {
  const body = /** @type {Record<string, unknown>} */ (request?.body || {});
  let entries = await readEntries(request.cookies["recipes"]);

  // Only allow existing entries or appending a new one.
  // Only digits count as id, as Number("") would be 0 and overwrite the first entry.
  const id = /^\d+$/.test(String(body["id"] ?? "")) ? Number(body["id"]) : NaN;
  const isValidId =
    Number.isInteger(id) &&
    id >= 0 &&
    (id < entries.length || (id === entries.length && entries.length < MAX_ENTRIES));

  const action = String(body["action"]);
  const isNew = id === entries.length;
  let error = "";
  /**
   * Values of the row shown in edit mode (at index `id`), if any.
   * @type {ReturnType<typeof toEntry> | undefined}
   */
  let editing;

  if (action === "save" && isValidId) {
    const entry = toEntry(body);
    // A new recipe without any text isn't stored, so no empty rows pile up.
    if (!isNew || entry.name || entry.cuisine || entry.difficulty) {
      const changed = [...entries];
      changed[id] = entry;
      const cookie = JSON.stringify(changed);
      if (fitsCookie(cookie)) {
        entries = changed;
        reply.setCookie("recipes", cookie, { path: "/fixi" });
      } else {
        // Changes which don't fit into the cookie (e.g. lots of emojis) aren't stored.
        // Keep the row open with the entered values, so they can be shortened.
        error = "Your changes are too long to be stored in a cookie. Please shorten them.";
        editing = entry;
      }
    }
  } else if (action === "edit" && isValidId && !isNew) {
    editing = entries[id];
  } else if (action === "create" && isValidId && isNew) {
    // A new recipe is only stored on "save", so leaving the empty row stores nothing.
    editing = toEntry({});
  }

  const rows = [...entries];
  if (editing) {
    rows[id] = editing;
  }
  // Hide "Add" while a new recipe is being entered.
  const isAdding = rows.length > entries.length;

  return (
    <article id="entries" class="card-secondary">
      {error && <p role="alert">{error}</p>}
      {rows.map(({ name, cuisine, difficulty }, index) => {
        const isEditMode = editing !== undefined && index === id;
        return (
          <form
            class="row"
            action="."
            method="post"
            fx-action="."
            fx-method="post"
            fx-target="#entries"
          >
            <input type="hidden" name="id" value={index} />
            <div class="col-md-3 col-sm-12">
              {isEditMode ? (
                <input type="text" name="name" value={name} placeholder="Name..." />
              ) : (
                name
              )}
            </div>
            <div class="col-md-3 col-sm-12">
              {isEditMode ? (
                <input type="text" name="cuisine" value={cuisine} placeholder="Cuisine..." />
              ) : (
                cuisine
              )}
            </div>
            <div class="col-md-3 col-sm-12">
              {isEditMode ? (
                <input
                  type="text"
                  name="difficulty"
                  value={difficulty}
                  placeholder="Difficulty..."
                />
              ) : (
                difficulty
              )}
            </div>
            <div class="col-md-3 col-sm-12">
              {isEditMode ? (
                <button class="btn btn-primary" type="submit" name="action" value="save">
                  Save
                </button>
              ) : (
                <button class="btn btn-primary" type="submit" name="action" value="edit">
                  Edit
                </button>
              )}
            </div>
          </form>
        );
      })}
      {isAdding ? null : entries.length < MAX_ENTRIES ? (
        <form
          class="row"
          action="."
          method="post"
          fx-action="."
          fx-method="post"
          fx-target="#entries"
        >
          <div class="offset-md-9 col-md-3 col-sm-12">
            <input type="hidden" name="id" value={entries.length} />
            <button class="btn btn-primary" type="submit" name="action" value="create">
              Add
            </button>
          </div>
        </form>
      ) : (
        <p class="center">
          <small>The list is full: at most {MAX_ENTRIES} recipes can be stored.</small>
        </p>
      )}
    </article>
  );
}
