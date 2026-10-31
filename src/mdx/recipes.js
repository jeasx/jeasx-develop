import cache from "../cache";

// Keep the recipes for a while, so not every visit has to wait for the API.
const cached = cache({ ttl: 5 * 60_000 });

/** Loads some recipes; returns an empty list if the API is slow or unavailable. */
export async function loadRecipes() {
  return (await cached("recipes", fetchRecipes)) ?? [];
}

async function fetchRecipes() {
  try {
    const response = await fetch("https://dummyjson.com/recipes?limit=5", {
      signal: AbortSignal.timeout(5000),
    });
    const { recipes } = response.ok ? await response.json() : {};
    return Array.isArray(recipes) ? recipes : undefined;
  } catch {
    return undefined;
  }
}
