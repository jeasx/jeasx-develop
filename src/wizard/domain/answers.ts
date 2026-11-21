import type { Errors, Form, StepId } from "./types";
import { cardBrand } from "./validate";

/**
 * Keeps the fields of a form: names starting with "$" are controls (e.g. "$action").
 * Only text is kept, so a posted file or JSON object doesn't end up in the cookie.
 */
export function toAnswers(body: unknown): Form {
  const answers: Form = {};
  // A JSON body can also be a number or string, whose characters would be stored as answers.
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body)) {
      if (!key.startsWith("$") && typeof value === "string") {
        answers[key] = value.slice(0, 200);
      }
    }
  }
  return answers;
}

/**
 * Returns the answers of a step as they may be stored.
 *
 * Card numbers must not end up in a cookie, even a signed one: signing protects against
 * changes, not against reading. Once a number is valid, only its brand and last four digits
 * are kept, and the security code is always dropped.
 */
export function toStorable(step: StepId, form: Form, errors: Errors): Form {
  if (step !== "extras") {
    return form;
  }
  const { card_number = "", card_cvc, ...rest } = form;
  if (rest.payment !== "card") {
    return Object.fromEntries(Object.entries(rest).filter(([key]) => !key.startsWith("card_")));
  }
  const number = card_number.replace(/[\s-]/g, "");
  if (number && !errors.card_number && !errors.card_cvc) {
    rest.card_last4 = number.slice(-4);
    rest.card_brand = cardBrand(number) ?? "";
  }
  return rest;
}
