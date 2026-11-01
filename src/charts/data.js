import { PLANETS as ALL_PLANETS } from "../@helpers/planets";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Approximate long-term average temperatures per month in °C.
 * Each city keeps its color, whichever cities are shown.
 */
export const CITIES = [
  {
    id: "berlin",
    name: "Berlin",
    color: "var(--series-1)",
    values: [0.6, 1.4, 4.8, 9.3, 14.2, 17.5, 19.6, 19.2, 15.0, 9.9, 5.0, 1.8],
  },
  {
    id: "madrid",
    name: "Madrid",
    color: "var(--series-2)",
    values: [6.3, 7.9, 11.2, 12.9, 16.7, 22.2, 25.6, 25.1, 20.9, 15.1, 9.9, 6.9],
  },
  {
    id: "oslo",
    name: "Oslo",
    color: "var(--series-3)",
    values: [-4.3, -4.0, -0.2, 4.5, 10.8, 15.2, 16.4, 15.2, 10.8, 6.3, 0.7, -3.1],
  },
  {
    id: "sydney",
    name: "Sydney",
    color: "var(--series-4)",
    values: [23.5, 23.4, 22.1, 19.5, 16.6, 14.2, 13.4, 14.5, 17.0, 19.0, 20.4, 22.1],
  },
];

/** Known moons per planet, in order of distance from the sun (shared with other examples). */
export const PLANETS = ALL_PLANETS.map(({ name, moons }) => ({ name, moons }));
