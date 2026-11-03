/** Loads jokes from the API; throws for network errors and error responses. */
export default async function fetchJokes(category = "general", amount = 3) {
  const response = await fetch(
    `/jokes/api/${encodeURIComponent(category)}?amount=${encodeURIComponent(amount)}`,
  );
  if (!response.ok) {
    throw new Error(`Loading jokes failed: ${response.status}`);
  }
  return await response.json();
}
