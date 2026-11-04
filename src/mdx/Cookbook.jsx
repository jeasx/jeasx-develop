import Recipe from "./Recipe.mdx";
import { emojiFor } from "./recipes";
import Tip from "./Tip";

/**
 * @param {{ recipes: import("./recipes").Recipe[], id: number }} props
 */
export default function Cookbook({ recipes, id }) {
  const recipe = recipes.find((recipe) => recipe.id === id);
  if (recipes.length === 0) {
    return (
      <p>The kitchen is closed: the recipe API is not available right now.</p>
    );
  }
  return (
    <>
      <ul class="recipe-cards">
        {recipes.map((r) => (
          <li>
            <a
              href={`?recipe=${r.id}#recipe`}
              aria-current={r === recipe ? "page" : undefined}
            >
              <span class="emoji" aria-hidden="true">
                {emojiFor(r)}
              </span>
              <strong>{r.name}</strong>
              <small>
                {r.cuisine} · {r.prepTimeMinutes + r.cookTimeMinutes} min
              </small>
            </a>
          </li>
        ))}
      </ul>
      {recipe && (
        <div id="recipe">
          {/* The components prop swaps Markdown elements for JSX components: every blockquote becomes a Tip. */}
          <Recipe recipe={recipe} components={{ blockquote: Tip }} />
        </div>
      )}
    </>
  );
}
