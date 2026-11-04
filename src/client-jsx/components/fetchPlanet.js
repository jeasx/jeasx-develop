/** Loads one planet from the API; throws for network errors and error responses. */
export default async function fetchPlanet(name) {
  const response = await fetch(`/client-jsx/api/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error(`Loading ${name} failed: ${response.status}`);
  }
  return await response.json();
}
