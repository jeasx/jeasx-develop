export const PLANETS = [
  { name: "Mercury", diameter: 4879, moons: 0 },
  { name: "Venus", diameter: 12104, moons: 0 },
  { name: "Earth", diameter: 12756, moons: 1 },
  { name: "Mars", diameter: 6792, moons: 2 },
  { name: "Jupiter", diameter: 142984, moons: 95 },
  { name: "Saturn", diameter: 120536, moons: 146 },
  { name: "Uranus", diameter: 51118, moons: 28 },
  { name: "Neptune", diameter: 49528, moons: 16 },
];

/** The formats of the planets route, in the order the server prefers them. */
export const OFFERS = ["text/html", "application/json", "text/csv", "text/plain"];
