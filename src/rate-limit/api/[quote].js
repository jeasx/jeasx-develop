const QUOTES = [
  "Make it work, make it right, make it fast. — Kent Beck",
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Premature optimization is the root of all evil. — Donald Knuth",
  "The best code is no code at all. — Jeff Atwood",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "First, solve the problem. Then, write the code. — John Johnson",
];

/**
 * An "expensive" API, protected by the guard in this folder.
 */
export default function () {
  return {
    quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
    time: new Date().toISOString(),
  };
}
