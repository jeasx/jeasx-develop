/**
 * The planets of the solar system, in order of distance from the sun.
 *
 * Diameter in km, distance from the sun in astronomical units (AU), orbital period (year)
 * in Earth days and surface gravity in m/s². Moon counts change with new discoveries:
 * these are the known moons as of March 2026 (see https://spaceplace.nasa.gov/how-many-moons/).
 *
 * @type {{ name: string, diameter: number, distance: number, moons: number,
 *   color: string, year: number, gravity: number }[]}
 */
export default [
  {
    name: "Mercury",
    diameter: 4879,
    distance: 0.39,
    moons: 0,
    color: "#a8a29e",
    year: 88,
    gravity: 3.7,
  },
  {
    name: "Venus",
    diameter: 12104,
    distance: 0.72,
    moons: 0,
    color: "#e8c07d",
    year: 225,
    gravity: 8.87,
  },
  {
    name: "Earth",
    diameter: 12756,
    distance: 1,
    moons: 1,
    color: "#3b82f6",
    year: 365,
    gravity: 9.81,
  },
  {
    name: "Mars",
    diameter: 6792,
    distance: 1.52,
    moons: 2,
    color: "#dc6b3f",
    year: 687,
    gravity: 3.71,
  },
  {
    name: "Jupiter",
    diameter: 142984,
    distance: 5.2,
    moons: 101,
    color: "#d4a373",
    year: 4333,
    gravity: 24.79,
  },
  {
    name: "Saturn",
    diameter: 120536,
    distance: 9.54,
    moons: 285,
    color: "#e9d8a6",
    year: 10759,
    gravity: 10.44,
  },
  {
    name: "Uranus",
    diameter: 51118,
    distance: 19.2,
    moons: 29,
    color: "#7dd3c0",
    year: 30687,
    gravity: 8.87,
  },
  {
    name: "Neptune",
    diameter: 49528,
    distance: 30.1,
    moons: 16,
    color: "#4f6fd8",
    year: 60190,
    gravity: 11.15,
  },
];
