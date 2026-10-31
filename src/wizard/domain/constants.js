const SLUGS = {
  SAVE: "/wizard/0-save",
  START: "/wizard/1-start",
  DAMAGE_TYPES: "/wizard/2-damage-types",
  CLAIM_REPORT: "/wizard/3-claim-report",
  CLAIMANT: "/wizard/4-claimant",
  INJURED_PARTY: "/wizard/5-injured-party",
  PERPETRATOR: "/wizard/6-perpetrator",
  DAMAGE_DETAILS: "/wizard/7-damage-details",
  DAMAGE_DETAILS_FOREIGN_VEHICLE: "/wizard/8-damage-details-foreign-vehicle",
  DAMAGE_DETAILS_OWN_VEHICLE: "/wizard/9-damage-details-own-vehicle",
  DAMAGE_DETAILS_ANIMAL_OR_OBJECT: "/wizard/10-damage-details-animal-or-object",
  DAMAGE_DETAILS_PERSON: "/wizard/11-damage-details-person",
  LEGAL_NOTICE: "/wizard/12-legal-notice",
  THANK_YOU: "/wizard/13-thank-you",
};

/** Token of a saved claim, e.g. "ID-1A2B3C4D". It is also the name of its cookie. */
const TOKEN_PATTERN = /^ID-[0-9A-F]{8}$/;

export { SLUGS, TOKEN_PATTERN };
