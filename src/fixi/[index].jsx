import { fitsCookie, readListCookie } from "../cookies";
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
      description="Jeasx integrates easily with Fixi.js"
      script="./index.js"
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
// If the recipes couldn't be loaded, wait this long before trying again.
const RETRY_DELAY = 60_000;

/** @type {Promise<ReturnType<typeof toEntry>[]> | undefined} */
let defaultEntries;
let failedAt = 0;

/**
 * Returns the starting point for every visitor; changes are stored per visitor in a cookie.
 * The recipes are loaded once and kept. If the API is unavailable, the list starts empty
 * and loading is tried again after RETRY_DELAY, so a short outage isn't kept until a restart.
 */
function getDefaultEntries() {
  if (!defaultEntries && Date.now() - failedAt >= RETRY_DELAY) {
    defaultEntries = loadRecipes().then((entries) => {
      if (!entries) {
        defaultEntries = undefined;
        failedAt = Date.now();
      }
      return entries ?? [];
    });
  }
  return defaultEntries ?? Promise.resolve([]);
}

// Start loading right away, so the first visitor doesn't have to wait as long.
getDefaultEntries();

/** Loads some recipes; returns undefined if the API is unavailable. */
async function loadRecipes() {
  try {
    const response = await fetch("https://dummyjson.com/recipes?limit=5", {
      signal: AbortSignal.timeout(5000),
    });
    const { recipes } = response.ok ? await response.json() : {};
    return Array.isArray(recipes) ? recipes.slice(0, MAX_ENTRIES).map(toEntry) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads the visitor's recipes from the cookie; falls back to the defaults
 * if it is missing or malformed.
 *
 * @param {string | undefined} cookie
 */
async function readEntries(cookie) {
  return readListCookie(cookie)?.slice(0, MAX_ENTRIES).map(toEntry) ?? (await getDefaultEntries());
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
  const id = Number(body["id"]);
  const isValidId =
    Number.isInteger(id) &&
    id >= 0 &&
    (id < entries.length || (id === entries.length && entries.length < MAX_ENTRIES));

  let error = "";
  if (["save", "create"].includes(String(body["action"])) && isValidId) {
    const changed = [...entries];
    changed[id] = toEntry(body);
    const cookie = JSON.stringify(changed);
    // Changes which don't fit into the cookie (e.g. lots of emojis) are dropped.
    if (fitsCookie(cookie)) {
      entries = changed;
      reply.setCookie("recipes", cookie, { path: "/fixi" });
    } else {
      error = "Your changes are too long to be stored in a cookie. Please shorten them.";
    }
  }

  return (
    <article id="entries" class="card-secondary">
      {error && <p role="alert">{error}</p>}
      {Object.entries(entries).map(([id, { name, cuisine, difficulty }]) => {
        const isEditMode = body["id"] === id && ["edit", "create"].includes(String(body["action"]));
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
      {entries.length < MAX_ENTRIES ? (
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
