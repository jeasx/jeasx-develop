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
    steps.push(SLUGS.INSURED);
  } else {
    steps.push(SLUGS.PERPETRATOR);
  }

  steps.push(SLUGS.DAMAGE_DETAILS);

  if (
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("1") ||
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("4")
  ) {
    steps.push(SLUGS.DAMAGE_DETAILS_FOREIGN_VEHICLE);
  }

  if (
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("3") ||
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("6")
  ) {
    steps.push(SLUGS.DAMAGE_DETAILS_OWN_VEHICLE);
  }

  if (
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("2") ||
    data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("5")
  ) {
    steps.push(SLUGS.DAMAGE_DETAILS_ANIMAL_OR_OBJECT);
  }

  if (data?.[SLUGS.DAMAGE_TYPES]?.["damage_types[]"]?.includes("7")) {
    steps.push(SLUGS.DAMAGE_DETAILS_PERSON);
  }

  steps.push(SLUGS.LEGAL_NOTICE);
  steps.push(SLUGS.THANK_YOU);
  steps.push(SLUGS.START);

  return steps;
}
