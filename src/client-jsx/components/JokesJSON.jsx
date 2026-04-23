import fetchJokes from "./fetchJokes";

export default async function JokesJSON({ category, amount }) {
  const jokes = await fetchJokes(category, amount);
  return (
    <pre>
      <code>{JSON.stringify(jokes, null, 2)}</code>
    </pre>
  );
}
