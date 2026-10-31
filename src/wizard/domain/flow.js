import { SLUGS } from "./constants";

/**
 * Generates a flow of steps based on the given data.
 *
 * @param {{ [x: string]: { [x: string]: string | string[]; }; }} data
 * @returns {string[]}
 */
export default function flow(data) {
  const steps = [];

  steps.push(SLUGS.START);
  steps.push(SLUGS.DAMAGE_TYPES);
  steps.push(SLUGS.CLAIM_REPORT);
  steps.push(SLUGS.CLAIMANT);

  if (data?.[SLUGS.CLAIM_REPORT]?.["claim_report"] === "Insured") {
    steps.push(SLUGS.INJURED_PARTY);
  } else {
    steps.push(SLUGS.PERPETRATOR);
  }

  steps.push(SLUGS.DAMAGE_DETAILS);

  // A single selection arrives as string, several as array. Without normalizing,
  // includes() would match substrings of a string (e.g. "1" in "10").
  const damageTypes = [data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"] ?? []].flat();

  if (damageTypes.includes("1") || damageTypes.includes("4")) {
    steps.push(SLUGS.DAMAGE_DETAILS_FOREIGN_VEHICLE);
  }

  if (damageTypes.includes("3") || damageTypes.includes("6")) {
    steps.push(SLUGS.DAMAGE_DETAILS_OWN_VEHICLE);
  }

  if (damageTypes.includes("2") || damageTypes.includes("5")) {
    steps.push(SLUGS.DAMAGE_DETAILS_ANIMAL_OR_OBJECT);
  }

  if (damageTypes.includes("7")) {
    steps.push(SLUGS.DAMAGE_DETAILS_PERSON);
  }

  steps.push(SLUGS.LEGAL_NOTICE);
  steps.push(SLUGS.THANK_YOU);
  steps.push(SLUGS.START);

  return steps;
}
