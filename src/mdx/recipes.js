import cache from "../@helpers/cache";

// Keep the recipes for a while, so not every visit has to wait for the API.
const cached = cache({ ttl: 5 * 60_000 });

const FIELDS = [
  "name",
  "cuisine",
  "difficulty",
  "prepTimeMinutes",
  "cookTimeMinutes",
  "servings",
  "caloriesPerServing",
  "rating",
  "reviewCount",
  "tags",
  "ingredients",
  "instructions",
];

/**
 * @typedef Recipe
 * @property {number} id
 * @property {string} name
 * @property {string} cuisine
 * @property {"Easy" | "Medium" | "Hard"} difficulty
 * @property {number} prepTimeMinutes
 * @property {number} cookTimeMinutes
 * @property {number} servings
 * @property {number} caloriesPerServing
 * @property {number} rating
 * @property {number} reviewCount
 * @property {string[]} tags
 * @property {string[]} ingredients
 * @property {string[]} instructions
 */

/**
 * Loads some recipes; returns an empty list if the API is slow or unavailable.
 * @returns {Promise<Recipe[]>}
 */
export async function loadRecipes() {
  return (await cached("recipes", fetchRecipes)) ?? [];
}

/** A dish emoji for each cuisine, so the recipe cards need no images from the API. */
export function emojiFor(/** @type {Recipe} */ { cuisine, tags }) {
  const emojis = {
    Italian: "🍝",
    Asian: "🥢",
    American: "🍪",
    Mexican: "🌮",
    Indian: "🍛",
    Mediterranean: "🫒",
    Japanese: "🍣",
    Thai: "🍜",
    Korean: "🍲",
    Greek: "🥗",
  };
  if (tags.includes("Pizza")) return "🍕";
  if (tags.includes("Cookies")) return "🍪";
  return emojis[cuisine] ?? "🍽️";
}

async function fetchRecipes() {
  try {
    const response = await fetch(
      `https://dummyjson.com/recipes?limit=6&select=${FIELDS.join(",")}`,
      { signal: AbortSignal.timeout(5000) },
    );
    const { recipes } = response.ok ? await response.json() : {};
    return Array.isArray(recipes) ? recipes : undefined;
  } catch {
    return undefined;
  }
}
