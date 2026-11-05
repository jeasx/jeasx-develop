import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { fitsCookie, readListCookie } from "../@helpers/cookies";
import Layout from "../Layout";
import { loadRecipes } from "../mdx/recipes";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Other sites must not overwrite the recipes cookie with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }
  // The same URL answers with the whole page or only the list, depending on this header,
  // so caches must keep one copy per value.
  reply.header("vary", "fx-request");
  if (request.headers["fx-request"] === "true") {
    return <Fragment request={request} reply={reply} />;
  }

  return (
    <Layout
      title="Use Fixi.js with Jeasx"
      description="Edit a list in place with Fixi.js, with a full page reload as fallback."
      css="/fixi/index.css"
      script="/fixi/index.js"
    >
      <div class="fx">
        <h1>Use Fixi.js with Jeasx</h1>
        <p>
          <a href="https://github.com/bigskysoftware/fixi">Fixi.js</a> is a minimalist alternative
          to HTMX, developed by the creators of HTMX. This example shows progressive enhancement:
          with JavaScript, Fixi.js swaps only the edited list; without it, the same forms reload the
          whole page and still work.
        </p>
        <h2>Recipe editor</h2>
        <Fragment request={request} reply={reply} />
      </div>
    </Layout>
  );
}

const MAX_ENTRIES = 10;
const MAX_LENGTH = 50;

// Start loading right away, so the first visitor doesn't have to wait as long.
loadRecipes();

/**
 * Reads the visitor's recipes from the cookie; falls back to the recipes from the API
 * (or an empty list if it is unavailable) if the cookie is missing, edited or malformed.
 *
 * @param {import("fastify").FastifyRequest} request
 */
async function readEntries(request) {
  return (readListCookie(request, "recipes") ?? (await loadRecipes()))
    .slice(0, MAX_ENTRIES)
    .map(toEntry);
}

/** @param {Record<string, unknown>} value */
function toEntry({ name, cuisine, difficulty }) {
  return {
    name: toText(name),
    cuisine: toText(cuisine),
    difficulty: toText(difficulty),
  };
}

/** @param {unknown} value */
function toText(value) {
  return String(value ?? "").slice(0, MAX_LENGTH);
}

/**
 * @param {import("../types").RouteProps} props
 */
async function Fragment({ request, reply }) {
  const body = /** @type {Record<string, unknown>} */ (request.body || {});
  let entries = await readEntries(request);

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
      if (fitsCookie(reply, cookie)) {
        entries = changed;
        reply.setCookie("recipes", cookie, { path: "/fixi", signed: true });
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
    <article id="entries" class="fx-list">
      {error && (
        <p class="fx-error" role="alert">
          {error}
        </p>
      )}
      <div class="fx-row fx-head" aria-hidden="true">
        <div>Name</div>
        <div>Cuisine</div>
        <div>Difficulty</div>
        <div></div>
      </div>
      {rows.length === 0 && <p class="fx-empty">No recipes yet. Add the first one!</p>}
      {rows.map(({ name, cuisine, difficulty }, index) => {
        const isEditMode = editing !== undefined && index === id;
        return (
          <form
            class={isEditMode ? "fx-row fx-editing" : "fx-row"}
            action="."
            method="post"
            fx-action="."
            fx-method="post"
            fx-target="#entries"
          >
            <input type="hidden" name="id" value={index} />
            <div data-label="Name">
              {isEditMode ? (
                <input aria-label="Name" type="text" name="name" value={name} placeholder="Name…" />
              ) : (
                name
              )}
            </div>
            <div data-label="Cuisine">
              {isEditMode ? (
                <input
                  aria-label="Cuisine"
                  type="text"
                  name="cuisine"
                  value={cuisine}
                  placeholder="Cuisine…"
                />
              ) : (
                cuisine
              )}
            </div>
            <div data-label="Difficulty">
              {isEditMode ? (
                <input
                  aria-label="Difficulty"
                  type="text"
                  name="difficulty"
                  value={difficulty}
                  placeholder="Difficulty…"
                />
              ) : (
                difficulty
              )}
            </div>
            <div class="fx-actions">
              {isEditMode ? (
                <>
                  <button class="fx-btn fx-primary" type="submit" name="action" value="save">
                    Save
                  </button>
                  <button class="fx-btn" type="submit" name="action" value="cancel">
                    Cancel
                  </button>
                </>
              ) : (
                <button class="fx-btn" type="submit" name="action" value="edit">
                  Edit
                </button>
              )}
            </div>
          </form>
        );
      })}
      {isAdding ? null : entries.length < MAX_ENTRIES ? (
        <form
          class="fx-add"
          action="."
          method="post"
          fx-action="."
          fx-method="post"
          fx-target="#entries"
        >
          <input type="hidden" name="id" value={entries.length} />
          <button class="fx-btn fx-primary" type="submit" name="action" value="create">
            + Add recipe
          </button>
        </form>
      ) : (
        <p class="fx-empty">
          <small>The list is full: at most {MAX_ENTRIES} recipes can be stored.</small>
        </p>
      )}
    </article>
  );
}
