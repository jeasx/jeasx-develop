export default async function fetchJokes(category = "general", amount = 3) {
  return await (await fetch(`/jokes/api/${category}?amount=${amount}`)).json();
}
