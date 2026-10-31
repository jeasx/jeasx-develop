import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  if (request.headers["fx-request"] === "true") {
    return <Fragment request={request} />;
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
      <Fragment request={request} />
    </Layout>
  );
}

const MAX_ENTRIES = 20;
const MAX_LENGTH = 100;

/** Shared by all visitors, so keep it small. */
const entries = await loadRecipes();

/** Loads some recipes; starts with an empty list if the API is unavailable. */
async function loadRecipes() {
  try {
    const response = await fetch("https://dummyjson.com/recipes?limit=5");
    const { recipes } = await response.json();
    return Array.isArray(recipes) ? recipes : [];
  } catch {
    return [];
  }
}

/** @param {unknown} value */
function toText(value) {
  return String(value ?? "").slice(0, MAX_LENGTH);
}

function Fragment({ request }) {
  const body = request?.body || {};

  // Only allow existing entries or appending a new one.
  const id = Number(body["id"]);
  const isValidId =
    Number.isInteger(id) &&
    id >= 0 &&
    (id < entries.length || (id === entries.length && entries.length < MAX_ENTRIES));

  if (["save", "create"].includes(body["action"]) && isValidId) {
    // Every visitor sees these entries, so store only short texts.
    entries[id] = {
      name: toText(body["name"]),
      cuisine: toText(body["cuisine"]),
      difficulty: toText(body["difficulty"]),
    };
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
