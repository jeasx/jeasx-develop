/**
 * @typedef {{ slug: string, name: string, colors: [string, string], diameter: number,
 *   moons: number, distance: number, fact: string }} Planet
 */

/** @type {Planet[]} Distance from the sun in astronomical units (AU), diameter in km. */
export const PLANETS = [
  {
    slug: "mercury",
    name: "Mercury",
    colors: ["#d6d1cb", "#6e6862"],
    diameter: 4879,
    moons: 0,
    distance: 0.39,
    fact: "A year on Mercury lasts only 88 Earth days.",
  },
  {
    slug: "venus",
    name: "Venus",
    colors: ["#f5deb0", "#b5835a"],
    diameter: 12104,
    moons: 0,
    distance: 0.72,
    fact: "Venus spins backwards, so the sun rises in the west there.",
  },
  {
    slug: "earth",
    name: "Earth",
    colors: ["#8fd3ff", "#1b5e9e"],
    diameter: 12756,
    moons: 1,
    distance: 1,
    fact: "The only planet known to support life.",
  },
  {
    slug: "mars",
    name: "Mars",
    colors: ["#f2a37a", "#9c3b1b"],
    diameter: 6792,
    moons: 2,
    distance: 1.52,
    fact: "Mars is home to Olympus Mons, the tallest volcano in the solar system.",
  },
  {
    slug: "jupiter",
    name: "Jupiter",
    colors: ["#f0d9b5", "#a8754a"],
    diameter: 142984,
    moons: 95,
    distance: 5.2,
    fact: "Its Great Red Spot is a storm larger than Earth.",
  },
  {
    slug: "saturn",
    name: "Saturn",
    colors: ["#f7e7b4", "#b89a5a"],
    diameter: 120536,
    moons: 146,
    distance: 9.54,
    fact: "Saturn is less dense than water.",
  },
  {
    slug: "uranus",
    name: "Uranus",
    colors: ["#c9f2f5", "#4fa3b0"],
    diameter: 51118,
    moons: 28,
    distance: 19.2,
    fact: "Uranus rotates on its side, tilted by about 98 degrees.",
  },
  {
    slug: "neptune",
    name: "Neptune",
    colors: ["#8fb0ff", "#22388f"],
    diameter: 49528,
    moons: 16,
    distance: 30.1,
    fact: "Winds on Neptune reach more than 2,000 km/h.",
  },
];

/**
 * Inline styles of a planet: its colors and the names of the view transition.
 * The old and the new page use the same names, so the browser morphs one into the other.
 *
 * @param {Planet} planet
 */
export function planetStyles({ slug, colors: [light, dark] }) {
  return {
    image: `background: radial-gradient(circle at 30% 30%, ${light}, ${dark}); view-transition-name: planet-${slug}`,
    name: `view-transition-name: name-${slug}`,
  };
}
