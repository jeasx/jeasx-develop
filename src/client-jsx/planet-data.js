import { PLANETS } from "../@helpers/planets";

/**
 * Values only this example shows: the color of the globe, the orbital period
 * in Earth days and the surface gravity in m/s².
 *
 * @type {Record<string, { color: string, year: number, gravity: number }>}
 */
const EXTRAS = {
  mercury: { color: "#a8a29e", year: 88, gravity: 3.7 },
  venus: { color: "#e8c07d", year: 225, gravity: 8.87 },
  earth: { color: "#3b82f6", year: 365, gravity: 9.81 },
  mars: { color: "#dc6b3f", year: 687, gravity: 3.71 },
  jupiter: { color: "#d4a373", year: 4333, gravity: 24.79 },
  saturn: { color: "#e9d8a6", year: 10759, gravity: 10.44 },
  uranus: { color: "#7dd3c0", year: 30687, gravity: 8.87 },
  neptune: { color: "#4f6fd8", year: 60190, gravity: 11.15 },
};

/** Diameter, distance and moons come from the shared data, so they match the other examples. */
export default PLANETS.map(({ slug, name, diameter, distance, moons }) => ({
  name,
  diameter,
  distance,
  moons,
  ...EXTRAS[slug],
}));
