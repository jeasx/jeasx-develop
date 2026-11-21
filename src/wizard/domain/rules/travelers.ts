import { findDestination } from "../catalog";
import { addMonths, ageOn, formatDate, parseDate, toDateString } from "../dates";
import { travelers } from "../travelers";
import { EMAIL, NAME, PASSPORT, PHONE } from "./patterns";
import type { Errors, Form } from "../types";

/**
 * Checks each traveler against the trip: ages on the day of departure, and passports which
 * are valid 6 months after the trip, as many countries require.
 */
export default function validateTravelers(form: Form, trip: Form): Errors {
  const errors: Errors = {};
  const destination = findDestination(trip.destination);
  const depart = parseDate(trip.depart);
  // Passports must be valid for 6 months after the trip, as many countries require.
  const end = parseDate(trip.type === "return" ? trip.return : trip.depart) ?? depart;

  for (const { key, kind } of travelers(trip)) {
    const value = (name) => String(form[`${key}_${name}`] ?? "").trim();

    for (const [name, label] of [
      ["first", "first name"],
      ["last", "last name"],
    ]) {
      if (!value(name)) {
        errors[`${key}_${name}`] = `Enter the ${label}.`;
      } else if (!NAME.test(value(name))) {
        errors[`${key}_${name}`] = `Use letters only for the ${label}.`;
      }
    }

    const birth = parseDate(value("birth"));
    if (birth === undefined) {
      errors[`${key}_birth`] = "Enter the date of birth.";
    } else if (depart !== undefined) {
      const age = ageOn(birth, depart);
      if (birth > depart || age > 120) {
        errors[`${key}_birth`] = "Check the date of birth.";
      } else if (kind === "adult" && age < 18) {
        errors[`${key}_birth`] =
          `Adults must be 18 on departure (${formatDate(trip.depart)}). Book as a child instead.`;
      } else if (kind === "child" && (age < 2 || age > 17)) {
        errors[`${key}_birth`] = "Children are 2 to 17 years old on departure.";
      } else if (kind === "infant" && age >= 2) {
        errors[`${key}_birth`] = "Infants are under 2 on departure.";
      }
    }

    if (destination?.passport) {
      const passport = value("passport").toUpperCase().replace(/\s/g, "");
      if (!passport) {
        errors[`${key}_passport`] = `${destination.country} requires a passport.`;
      } else if (!PASSPORT.test(passport)) {
        errors[`${key}_passport`] = "Passport numbers have 6 to 9 letters and digits.";
      }
      const expiry = parseDate(value("expiry"));
      if (expiry === undefined) {
        errors[`${key}_expiry`] = "Enter the expiry date.";
      } else if (end !== undefined && expiry < addMonths(end, 6)) {
        errors[`${key}_expiry`] =
          `Must be valid until ${formatDate(toDateString(addMonths(end, 6)))}, 6 months after your trip.`;
      }
    }
  }

  const email = String(form.email ?? "").trim();
  if (!email) {
    errors.email = "Enter an email for your tickets.";
  } else if (!EMAIL.test(email)) {
    errors.email = "Check the email address, e.g. ada@example.com.";
  }
  const phone = String(form.phone ?? "").trim();
  if (!phone) {
    errors.phone = "Enter a phone number for delays and gate changes.";
  } else if (!PHONE.test(phone)) {
    errors.phone = "Check the phone number, e.g. +49 30 1234567.";
  }
  return errors;
}
