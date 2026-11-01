import { PLANETS as ALL_PLANETS } from "../@helpers/planets";

/** Only the fields this example shows in all formats. */
export const PLANETS = ALL_PLANETS.map(({ name, diameter, moons }) => ({ name, diameter, moons }));

/** The formats of the planets route, in the order the server prefers them. */
export const OFFERS = ["text/html", "application/json", "text/csv", "text/plain"];
