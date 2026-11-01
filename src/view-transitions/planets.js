// The planet data is shared with other examples, so their numbers always match.
export { PLANETS } from "../@helpers/planets";

/**
 * Inline styles of a planet: its colors and the names of the view transition.
 * The old and the new page use the same names, so the browser morphs one into the other.
 *
 * @param {import("../@helpers/planets").Planet} planet
 */
export function planetStyles({ slug, colors: [light, dark] }) {
  return {
    image: `background: radial-gradient(circle at 30% 30%, ${light}, ${dark}); view-transition-name: planet-${slug}`,
    name: `view-transition-name: name-${slug}`,
  };
}
