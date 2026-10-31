import { SLUGS } from "./constants";

/**
 * @param {string} path
 * @param {{ [x: string]: string; }} form
 */
export default function validator(path, form) {
  const errors = {};

  switch (path) {
    case SLUGS.DAMAGE_TYPES:
      if (!form?.["damage_types[]"]) {
        errors["damage_types[]"] = "Please select at least one damage type.";
      }
      break;

    case SLUGS.CLAIM_REPORT:
      if (!form?.["claim_report"]) {
        errors["claim_report"] = "Please select an option.";
      }
      break;
  }

  // 6 to 30 characters ending with a digit. A single character class keeps the check fast:
  // nested quantifiers like ([\d ]+){6,} take exponential time for inputs like "1111…x".
  if (form?.["phone"] && !/^[\d ()+\/.\-–]{5,29}\d$/.test(form?.["phone"])) {
    errors["phone"] = "Please enter a valid phone number.";
  }

  if (form?.["zip"] && !/^\d{5}$/.test(form?.["zip"])) {
    errors["zip"] = "Please enter a valid postal code.";
  }

  return errors;
}
