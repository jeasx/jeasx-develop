import { LIMITS, findCabin, findDestination } from "../catalog";
import { addDays, addMonths, parseDate, today } from "../dates";
import type { Errors, Form } from "../types";

/**
 * Where, when, who and how: dates must lie ahead and in order, and the travelers must fit.
 */
export default function validateTrip(form: Form, now: Date): Errors {
  const errors: Errors = {};
  const start = today(now);

  if (!findDestination(form.destination)) {
    errors.destination = "Pick a destination.";
  }
  if (form.type !== "return" && form.type !== "oneway") {
    errors.type = "Choose return or one-way.";
  }

  const depart = parseDate(form.depart);
  if (depart === undefined) {
    errors.depart = "Enter your departure date.";
  } else if (depart < addDays(start, 1)) {
    errors.depart = "Departures can be booked from tomorrow on.";
  } else if (depart > addMonths(start, 12)) {
    errors.depart = "Departures can be booked up to 12 months ahead.";
  }

  if (form.type === "return") {
    const back = parseDate(form.return);
    if (back === undefined) {
      errors.return = "Enter your return date.";
    } else if (depart !== undefined && back <= depart) {
      errors.return = "Return after your departure, at least one night later.";
    } else if (depart !== undefined && back > addDays(depart, LIMITS.nights)) {
      errors.return = `Trips can last up to ${LIMITS.nights} nights.`;
    }
  }

  const count = (name, min, max) => {
    const value = String(form[name] ?? "");
    if (!/^\d{1,2}$/.test(value) || Number(value) < min || Number(value) > max) {
      errors[name] = `Choose between ${min} and ${max}.`;
      return 0;
    }
    return Number(value);
  };
  const adults = count("adults", 1, LIMITS.adults);
  const children = count("children", 0, LIMITS.children);
  const infants = count("infants", 0, LIMITS.infants);
  if (!errors.infants && !errors.adults && infants > adults) {
    errors.infants = "Each infant travels on the lap of an adult.";
  }
  if (
    !errors.adults &&
    !errors.children &&
    !errors.infants &&
    adults + children + infants > LIMITS.travelers
  ) {
    errors.children = `A booking holds up to ${LIMITS.travelers} travelers.`;
  }

  if (!findCabin(form.cabin)) {
    errors.cabin = "Choose a cabin.";
  }
  return errors;
}
