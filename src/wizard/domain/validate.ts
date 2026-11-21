// One validator for server and browser: the browser checks fields while you type,
// the server checks again on every submit (it can't trust the browser) and before booking.
// Each step has its rules in "./rules". Rules may look at other steps, e.g. a passport must
// still be valid 6 months after the return date chosen in the first step.
import validateExtras from "./rules/extras";
import validateTravelers from "./rules/travelers";
import validateTrip from "./rules/trip";
import type { Data, Errors, StepId } from "./types";

export { cardBrand, luhn } from "./rules/card";

/** Validates a step against all answers (`data`), including the step's own. */
export default function validate(step: StepId, data: Data, now = new Date()): Errors {
  const form = data[step] ?? {};
  switch (step) {
    case "trip":
      return validateTrip(form, now);
    case "travelers":
      return validateTravelers(form, data.trip ?? {});
    case "extras":
      return validateExtras(form, data, now);
    case "review":
      return form.terms === "on" ? {} : { terms: "Please accept the terms to book your trip." };
    default:
      return {};
  }
}
