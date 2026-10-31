import Layout from "../Layout";

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
      description="Jeasx integrates easily with fixi.js"
      script="./index.js"
    >
      <h1>Fixi.js and Jeasx - lightweight hypermedia controls</h1>
      <p>
        <a href="https://github.com/bigskysoftware/fixi">Fixi.js</a> is a minimalist alternative to
        HTMX, developed by the creators of HTMX. Enhancing a Jeasx server rendered application with
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
// Browsers silently drop cookies larger than about 4 KB (name, value and attributes).
const MAX_COOKIE_SIZE = 3800;

/** Starting point for every visitor; changes are stored per visitor in a cookie. */
const DEFAULT_ENTRIES = await loadRecipes();

/** Loads some recipes; starts with an empty list if the API is unavailable. */
async function loadRecipes() {
  try {
    // Runs while the module loads, so a hanging server would block the first request.
    const response = await fetch("https://dummyjson.com/recipes?limit=5", {
      signal: AbortSignal.timeout(5000),
    });
    const { recipes } = await response.json();
    return Array.isArray(recipes) ? recipes.slice(0, MAX_ENTRIES).map(toEntry) : [];
  } catch {
    return [];
  }
}

/**
 * Reads the visitor's recipes from the cookie; falls back to the defaults
 * if it is missing or malformed.
 *
 * @param {string | undefined} cookie
 */
function readEntries(cookie) {
  try {
    const entries = JSON.parse(cookie);
    // The cookie can be edited by the client, so check its content.
    if (Array.isArray(entries)) {
      return entries
        .filter((entry) => entry && typeof entry === "object")
        .slice(0, MAX_ENTRIES)
        .map(toEntry);
    }
  } catch {}
  return DEFAULT_ENTRIES;
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
function Fragment({ request, reply }) {
  const body = request?.body || {};
  let entries = readEntries(request.cookies["recipes"]);

  // Only allow existing entries or appending a new one.
  const id = Number(body["id"]);
  const isValidId =
    Number.isInteger(id) &&
    id >= 0 &&
    (id < entries.length || (id === entries.length && entries.length < MAX_ENTRIES));

  if (["save", "create"].includes(body["action"]) && isValidId) {
    const changed = [...entries];
    changed[id] = toEntry(body);
    const cookie = JSON.stringify(changed);
    // Ignore changes which don't fit into the cookie (e.g. lots of emojis).
    if (encodeURIComponent(cookie).length <= MAX_COOKIE_SIZE) {
      entries = changed;
      reply.setCookie("recipes", cookie);
    }
  }

  return (
    <article id="entries" class="card-secondary">
      {Object.entries(entries).map(([id, { name, cuisine, difficulty }]) => {
        const isEditMode = body["id"] === id && ["edit", "create"].includes(body["action"]);
        return (
          <form
            class="row"
            action="."
            method="post"
            fx-action="."
            fx-method="post"
            fx-target="#entries"
          >
            <input type="hidden" name="id" value={id} />
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
    </article>
  );
}
