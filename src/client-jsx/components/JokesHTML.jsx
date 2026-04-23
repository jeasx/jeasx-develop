import fetchJokes from "./fetchJokes";

export default async function JokesHTML({ category, amount }) {
  const jokes = await fetchJokes(category, amount);
  return (
    <ul>
      {jokes.map((joke) => (
        <li>{joke}</li>
      ))}
    </ul>
  );
}
