import { INVOICE_LIMIT, findDestination, formatPrice } from "../catalog";
import quote from "../price";
import validateCard from "./card";
import type { Data, Errors, Form } from "../types";

/**
 * Bags, insurance and payment. Invoices depend on the price of the whole trip, so adding a
 * traveler in the first step can make this step invalid again.
 */
export default function validateExtras(form: Form, data: Data, now: Date): Errors {
  const errors: Errors = {};
  const trip = data.trip ?? {};

  if (!["0", "1", "2"].includes(String(form.bags ?? ""))) {
    errors.bags = "Choose how many bags to check in.";
  }
  if (
    findDestination(trip.destination)?.passport &&
    form.insurance !== "yes" &&
    form.insurance !== "no"
  ) {
    errors.insurance = "Decide on travel insurance for this long-haul trip.";
  }

  if (form.payment === "invoice") {
    const total = quote(data)?.total ?? 0;
    if (total > INVOICE_LIMIT) {
      errors.payment = `Invoices are available up to ${formatPrice(INVOICE_LIMIT)}. Your trip costs ${formatPrice(total)}, so please pay by card.`;
    }
  } else if (form.payment === "card") {
    Object.assign(errors, validateCard(form, trip, now));
  } else {
    errors.payment = "Choose how to pay.";
  }
  return errors;
}
