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

  if (
    form?.["phone"] &&
    !/^(\(?([\d \-)–+(]+\/?){6,}\)?([ .\-–/]?)([\d]+))$/im.test(form?.["phone"])
  ) {
    errors["phone"] = "Please enter a valid phone number.";
  }

  if (form?.["zip"] && !/^\d{5}$/im.test(form?.["zip"])) {
    errors["zip"] = "Please enter a valid zip code.";
  }

  return errors;
}
