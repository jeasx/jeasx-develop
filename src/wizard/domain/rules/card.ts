import { parseDate, today } from "../dates";
import { NAME } from "./patterns";
import type { Errors, Form } from "../types";

/**
 * The card number is never stored (see [...guard].ts): once accepted, only its brand and
 * last four digits are kept. So a stored card is valid without number and security code.
 */
export default function validateCard(form: Form, trip: Form, now: Date): Errors {
  const errors: Errors = {};
  if (!NAME.test(String(form.card_name ?? "").trim())) {
    errors.card_name = "Enter the name as printed on the card.";
  }

  const number = String(form.card_number ?? "").replace(/[\s-]/g, "");
  const brand = cardBrand(number);
  if (number) {
    if (!/^\d{12,19}$/.test(number)) {
      errors.card_number = "Card numbers have 12 to 19 digits.";
    } else if (!luhn(number)) {
      errors.card_number = "This card number has a typo: its check digit doesn't match.";
    } else if (!brand) {
      errors.card_number = "We accept Visa, Mastercard and American Express.";
    }
    const cvc = String(form.card_cvc ?? "").trim();
    const length = brand === "Amex" ? 4 : 3;
    if (!new RegExp(`^\\d{${length}}$`).test(cvc)) {
      errors.card_cvc = `Enter the ${length} digits ${brand === "Amex" ? "on the front" : "on the back"}.`;
    }
  } else if (!/^\d{4}$/.test(String(form.card_last4 ?? ""))) {
    errors.card_number = "Enter your card number.";
  }

  const match = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(String(form.card_expiry ?? "").trim());
  if (!match) {
    errors.card_expiry = "Use MM/YY, e.g. 08/29.";
  } else {
    // A card is valid through the last day of its month.
    const validThrough = Date.UTC(2000 + Number(match[2]), Number(match[1]), 0);
    const end = parseDate(trip.type === "return" ? trip.return : trip.depart);
    if (validThrough < today(now)) {
      errors.card_expiry = "This card has expired.";
    } else if (end !== undefined && validThrough < end) {
      errors.card_expiry = "The card expires before your trip ends.";
    }
  }
  return errors;
}

export function luhn(number: string) {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** Expects digits only. */
export function cardBrand(number: string): "Visa" | "Mastercard" | "Amex" | undefined {
  if (/^4\d{12}(\d{3}){0,2}$/.test(number)) return "Visa";
  if (/^(5[1-5]\d{2}|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/.test(number))
    return "Mastercard";
  if (/^3[47]\d{13}$/.test(number)) return "Amex";
  return undefined;
}
